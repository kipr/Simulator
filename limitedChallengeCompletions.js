/* eslint-env node */
const express = require('express');
const admin = require('firebase-admin');

/**
 * Generate a deterministic pseudonym from a user ID for privacy.
 * Uses FNV-1a hash to convert the UID to a consistent pseudonym.
 * @param {string} uid - The user's unique identifier
 * @returns {string} A pseudonym like "cyan-plasma-dolphin-42"
 */
function anonymizeUserId(uid) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
    'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet', 'gold', 'silver', 'bronze', 'maroon', 'tan', 'navy', 'aqua'];
  const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'metal', 'wood', 'ice',
    'shadow', 'spirit', 'void', 'plasma', 'gravity', 'time', 'space', 'aether', 'chaos', 'order'];
  const animals = ['tiger', 'bear', 'wolf', 'eagle', 'shark', 'whale', 'lion', 'panther', 'jaguar',
    'fox', 'owl', 'hawk', 'dolphin', 'rhino', 'hippo', 'giraffe', 'zebra',
    'koala', 'panda', 'leopard', 'lynx', 'bison', 'buffalo', 'camel',
    'raven', 'sparrow', 'swan', 'toucan', 'vulture', 'walrus', 'yak'];

  // FNV-1a hash function to convert string to 32-bit integer
  const stringTo32BitInt = (id) => {
    const FNV_PRIME = 0x01000193; // 16777619
    let hash = 0x811c9dc5; // FNV offset basis

    for (let i = 0; i < id.length; i++) {
      hash ^= id.charCodeAt(i);
      hash = (hash * FNV_PRIME) >>> 0;
    }

    return hash >>> 0;
  };

  const hash = Math.abs(stringTo32BitInt(uid));
  const color = colors[hash % colors.length];
  const element = elements[hash % elements.length];
  const animal = animals[hash % animals.length];
  const number = hash % 97;

  return `${color}-${element}-${animal}-${number}`;
}

/**
 * Creates an Express router for handling limited challenge completion CRUD operations.
 * 
 * Firestore structure:
 *   limited_challenge_completions/{challengeId}/completions/{uid}
 * 
 * This structure enables efficient leaderboard queries by fetching all completions
 * for a specific challenge.
 * 
 * Required Firestore indexes:
 *   Collection: completions (under limited_challenge_completions/{challengeId})
 *   
 *   1. Single-field indexes (auto-created by Firestore):
 *      - bestRuntimeMs ASC/DESC
 *      - bestCompletionTime ASC/DESC
 *   
 *   2. Composite indexes (required for sortBy=completionTime with range filters):
 *      - bestRuntimeMs ASC, bestCompletionTime ASC
 *      - bestRuntimeMs ASC, bestCompletionTime DESC
 *      
 *   To create via Firebase Console:
 *   1. Go to Firestore > Indexes
 *   2. Add composite indexes for collection "completions"
 *   
 *   Or create firestore.indexes.json:
 *   {
 *     "indexes": [
 *       {
 *         "collectionGroup": "completions",
 *         "queryScope": "COLLECTION",
 *         "fields": [
 *           { "fieldPath": "bestRuntimeMs", "order": "ASCENDING" },
 *           { "fieldPath": "bestCompletionTime", "order": "ASCENDING" }
 *         ]
 *       },
 *       {
 *         "collectionGroup": "completions",
 *         "queryScope": "COLLECTION",
 *         "fields": [
 *           { "fieldPath": "bestRuntimeMs", "order": "ASCENDING" },
 *           { "fieldPath": "bestCompletionTime", "order": "DESCENDING" }
 *         ]
 *       }
 *     ]
 *   }
 */
module.exports = function createLimitedChallengeCompletionsRouter(firebaseTokenManager) {
  const router = express.Router();

  // Ensure Firebase Admin is initialized (may already be initialized by firebaseAuth.js)
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const db = admin.firestore();

  /**
   * Auth middleware: Verify Firebase ID token and attach user info to request.
   */
  router.use(async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      
      if (!token) {
        return res.status(401).json({ message: 'Missing bearer token' });
      }

      const decoded = await firebaseTokenManager.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
      };
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  });

  /**
   * Helper to get the Firestore document reference for a user's completion.
   */
  const getCompletionRef = (challengeId, uid) => {
    return db
      .collection('limited_challenge_completions')
      .doc(challengeId)
      .collection('completions')
      .doc(uid);
  };

  /**
   * GET /:challengeId
   * 
   * Get the current user's completion for a specific challenge.
   * Returns 404 if no completion exists (frontend will create one).
   */
  router.get('/:challengeId', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { uid } = req.user;

      const docRef = getCompletionRef(challengeId, uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Completion not found' });
      }

      const data = doc.data();
      // Remove internal fields before sending to frontend
      delete data.uid;
      delete data.updatedAt;

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching completion:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * POST /:challengeId
   * 
   * Create or update the current user's completion for a specific challenge.
   * Returns 204 on success (matching the pattern expected by Db.ts).
   */
  router.post('/:challengeId', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { uid } = req.user;
      const data = req.body || {};

      const docRef = getCompletionRef(challengeId, uid);

      // Merge with existing data and add metadata
      // Use anonymized UID as displayName for privacy
      const completionData = {
        ...data,
        uid,
        displayName: anonymizeUserId(uid),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.set(completionData, { merge: true });

      return res.status(204).send();
    } catch (error) {
      console.error('Error saving completion:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * DELETE /:challengeId
   * 
   * Delete the current user's completion for a specific challenge.
   * Returns 204 on success.
   */
  router.delete('/:challengeId', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { uid } = req.user;

      const docRef = getCompletionRef(challengeId, uid);
      await docRef.delete();

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting completion:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * Helper to get the completions collection for a challenge.
   */
  const getCompletionsCollection = (challengeId) => {
    return db
      .collection('limited_challenge_completions')
      .doc(challengeId)
      .collection('completions');
  };

  /**
   * Helper to format a completion document for leaderboard display.
   */
  const formatLeaderboardEntry = (data) => ({
    uid: data.uid,
    displayName: data.displayName || 'Anonymous',
    bestRuntimeMs: data.bestRuntimeMs,
    bestCompletionTime: data.bestCompletionTime,
  });

  /**
   * GET /:challengeId/leaderboard/around-me
   * 
   * Get leaderboard with top N entries plus context around the current user.
   * Query params:
   *   - top (default: 10): Number of top entries to always include
   *   - range (default: 5): Number of entries above/below user to include
   *   - sortBy (default: 'runtime'): Sort field - 'runtime' or 'completionTime'
   * 
   * Response shape:
   * {
   *   topEntries: LeaderboardEntry[],
   *   userContext?: {
   *     rank: number,
   *     entriesAbove: LeaderboardEntry[],
   *     userEntry: LeaderboardEntry,
   *     entriesBelow: LeaderboardEntry[]
   *   },
   *   totalParticipants: number,
   *   sortBy: 'runtime' | 'completionTime'
   * }
   */
  router.get('/:challengeId/leaderboard/around-me', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { uid } = req.user;
      
      // Parse and validate query params
      const top = Math.min(Math.max(parseInt(req.query.top, 10) || 10, 1), 100);
      const range = Math.min(Math.max(parseInt(req.query.range, 10) || 5, 1), 50);
      const sortBy = req.query.sortBy === 'completionTime' ? 'completionTime' : 'runtime';
      
      // Determine sort field based on sortBy parameter
      const sortField = sortBy === 'completionTime' ? 'bestCompletionTime' : 'bestRuntimeMs';
      
      const completionsCollection = getCompletionsCollection(challengeId);
      
      // Helper to create base query - uses sort field for filtering to avoid
      // Firestore's limitation on inequality filters across multiple fields.
      // orderBy implicitly filters out documents where the field doesn't exist.
      const baseQuery = () => completionsCollection.orderBy(sortField, 'asc');
      
      // Run queries in parallel where possible
      const [userDoc, totalSnapshot, topSnapshot] = await Promise.all([
        // 1. Get user's completion
        getCompletionRef(challengeId, uid).get(),
        // 2. Get total count of participants (use bestRuntimeMs as canonical "has completion" check)
        completionsCollection
          .where('bestRuntimeMs', '>', 0)
          .count()
          .get(),
        // 3. Get top N entries (sorted by the selected field)
        baseQuery()
          .limit(top)
          .get(),
      ]);
      
      const totalParticipants = totalSnapshot.data().count;
      
      // Format top entries
      const topEntries = [];
      topSnapshot.forEach(doc => {
        topEntries.push(formatLeaderboardEntry(doc.data()));
      });
      
      // If user has no completion or no bestRuntimeMs, return top entries only
      if (!userDoc.exists || !userDoc.data().bestRuntimeMs) {
        return res.status(200).json({
          topEntries,
          userContext: undefined,
          totalParticipants,
          sortBy,
        });
      }
      
      const userData = userDoc.data();
      const userSortValue = userData[sortField];
      const userEntry = formatLeaderboardEntry(userData);
      
      // Get user's rank via count() aggregation (count entries with better sort value)
      const rankSnapshot = await completionsCollection
        .where(sortField, '<', userSortValue)
        .count()
        .get();
      const rank = rankSnapshot.data().count + 1;
      
      // Check if user is already in top N
      const userInTopN = rank <= top;
      
      let entriesAbove = [];
      let entriesBelow = [];
      
      if (!userInTopN) {
        // Fetch context around the user
        const [aboveSnapshot, belowSnapshot] = await Promise.all([
          // Entries above (better sort value) - order descending to get closest first
          completionsCollection
            .where(sortField, '<', userSortValue)
            .orderBy(sortField, 'desc')
            .limit(range)
            .get(),
          // Entries below (worse sort value)
          completionsCollection
            .where(sortField, '>', userSortValue)
            .orderBy(sortField, 'asc')
            .limit(range)
            .get(),
        ]);
        
        // Reverse entriesAbove so they're in ascending order (best first)
        aboveSnapshot.forEach(doc => {
          entriesAbove.unshift(formatLeaderboardEntry(doc.data()));
        });
        
        belowSnapshot.forEach(doc => {
          entriesBelow.push(formatLeaderboardEntry(doc.data()));
        });
      }
      
      return res.status(200).json({
        topEntries,
        userContext: {
          rank,
          entriesAbove,
          userEntry,
          entriesBelow,
        },
        totalParticipants,
        sortBy,
      });
    } catch (error) {
      console.error('Error fetching leaderboard around user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * GET /:challengeId/leaderboard
   * 
   * Get all completions for a challenge, ordered by best runtime.
   * Only returns the fields needed for leaderboard display.
   */
  router.get('/:challengeId/leaderboard', async (req, res) => {
    try {
      const { challengeId } = req.params;

      const snapshot = await getCompletionsCollection(challengeId)
        .where('bestRuntimeMs', '>', 0)
        .orderBy('bestRuntimeMs', 'asc')
        .limit(100)
        .get();

      const leaderboard = [];
      snapshot.forEach(doc => {
        leaderboard.push(formatLeaderboardEntry(doc.data()));
      });

      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
