/* eslint-env node */
const express = require('express');
const admin = require('firebase-admin');

/**
 * Creates an Express router for handling limited challenge completion CRUD operations.
 * 
 * Firestore structure:
 *   limited_challenge_completions/{challengeId}/completions/{uid}
 * 
 * This structure enables efficient leaderboard queries by fetching all completions
 * for a specific challenge.
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
        displayName: decoded.name || decoded.email || 'Anonymous',
        email: decoded.email,
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
      const { uid, displayName } = req.user;
      const data = req.body || {};

      const docRef = getCompletionRef(challengeId, uid);

      // Merge with existing data and add metadata
      const completionData = {
        ...data,
        uid,
        displayName,
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
   * GET /:challengeId/leaderboard
   * 
   * Get all completions for a challenge, ordered by best runtime.
   * Only returns the fields needed for leaderboard display.
   */
  router.get('/:challengeId/leaderboard', async (req, res) => {
    try {
      const { challengeId } = req.params;
      console.log('get leaderboard for challenge', challengeId);

      const completionsRef = db
        .collection('limited_challenge_completions')
        .doc(challengeId)
        .collection('completions')
        .where('bestRuntimeMs', '>', 0)
        .orderBy('bestRuntimeMs', 'asc')
        .limit(100); // Limit to top 100 for performance

      const snapshot = await completionsRef.get();

      const leaderboard = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        leaderboard.push({
          uid: data.uid,
          displayName: data.displayName || 'Anonymous',
          bestRuntimeMs: data.bestRuntimeMs,
          bestCompletionTime: data.bestCompletionTime,
        });
      });

      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
