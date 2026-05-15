/* eslint-env node */
const express = require('express');
const admin = require('firebase-admin');

// You already have FirebaseTokenManager; we’ll use it to verify the ID token.
module.exports = function createClassroomsRouter(firebaseTokenManager) {
  const router = express.Router();

  // Ensure Admin is initialized once
  if (!admin.apps.length) {
    // If you already init admin elsewhere, remove this init block.
    admin.initializeApp({
      credential: admin.credential.cert(
        firebaseTokenManager.serviceAccountKey || {},
      ),
    });
  }

  router.use((req, res, next) => {
    next();
  });

  // Auth middleware: decode Firebase token into req.user
  router.use(async (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Missing bearer token' });

      const decoded = await firebaseTokenManager.verifyIdToken(token);
      req.user = { uid: decoded.uid };
      next();
    } catch (e) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  const colPath = () => admin.firestore().collection('classrooms');

  // CREATE classroom
  router.post('/:id', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      const firestore = admin.firestore();
      const classroomData = {
        ...data,
        teacherId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await firestore.collection('classrooms').doc(id)
        .set(classroomData);

      return res.status(204).json({ id, ...classroomData });
    } catch (err) {
      console.error('POST /classrooms/ error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // GET student in classroom challenges
  router.get('/:id/challenges', async (req, res) => {
    try {
      const { id } = req.params;
      const qsnap = await admin
        .firestore()
        .collection('user')
        .doc(id)
        .collection('challenge_completion')
        .get();
      const result = {};
      qsnap.forEach((doc) => {
        result[doc.id] = doc.data();
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('GET /classrooms list error:', err);
      return res.status(500).json({ message: err.message });
    }
  });
  router.get('/debug/all-challenge-completions', async (req, res) => {
    try {
      const qsnap = await admin
        .firestore()
        .collectionGroup('challenge_completion')
        .get();

      const result = [];

      qsnap.forEach((doc) => {
        result.push({
          id: doc.id,
          data: doc.data(),
          path: doc.ref.path,
        });
      });

      return res.status(200).json(result);
    } catch (err) {
      console.error('Debug collectionGroup error:', err);
      return res.status(500).json({ message: err.message });
    }
  });
  router.get('/:classroomId/gradebook/challenges', async (req, res) => {
    try {
      const { classroomId } = req.params;

      const classroomDoc = await admin
        .firestore()
        .collection('classrooms')
        .doc(classroomId)
        .get();

      if (!classroomDoc.exists) {
        return res.status(404).json({ message: 'Classroom not found' });
      }

      const classroom = classroomDoc.data();
      const studentIds = Object.keys(classroom.studentIds || {});

      if (studentIds.length === 0) {
        return res.status(200).json({});
      }

      const snapshots = await Promise.all(
        studentIds.map((studentId) =>
          admin
            .firestore()
            .collection('user')
            .doc(studentId)
            .collection('challenge_completion')
            .get()
            .then((snap) => ({ studentId, snap })),
        ),
      );

      const result = {};

      snapshots.forEach(({ studentId, snap }) => {
        result[studentId] = {};

        snap.forEach((doc) => {
          result[studentId][doc.id] = doc.data();
        });
      });

      return res.status(200).json(result);
    } catch (err) {
      console.error('GET /:classroomId/gradebook/challenges error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // GET all students in classroom challenges
  router.get('/challenges', async (req, res) => {
    try {
      let studentIds = req.query.studentId || [];
      if (!Array.isArray(studentIds)) {
        studentIds = [studentIds];
      }
      const result = {};

      for (const studentId of studentIds) {
        const qsnap = await admin
          .firestore()
          .collection('user')
          .doc(studentId)
          .collection('challenge_completion')
          .get();

        result[studentId] = qsnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error('GET /classrooms list error:', err);
      return res.status(500).json({ message: err.message });
    }
  });
  router.get('/myClassroom', async (req, res) => {
    try {
      const { uid } = req.user;

      const qsnap = await admin
        .firestore()
        .collection('classrooms')
        .where(`studentIds.${uid}`, '!=', null)
        .get();

      const result = {};
      qsnap.forEach((doc) => (result[doc.id] = doc.data()));

      return res.status(200).json(result);
    } catch (err) {
      console.error('GET /classrooms/myClassroom error:', err);
      return res.status(500).json({ message: err.message });
    }
  });
  // READ one classroom
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await admin
        .firestore()
        .collection('classrooms')
        .doc(id)
        .get();

      if (!doc.exists) {
        return res.status(404).json({});
      }

      return res.status(200).json({ [id]: doc.data() });
    } catch (err) {
      console.error('GET /classrooms/:id error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // LIST classrooms (owned by this user)
  router.get('/', async (req, res) => {
    try {
      const inviteCode = req.query.inviteCode;
      if (inviteCode) {
        const qsnap = await admin.firestore().collection('classrooms')
          .get();
        const want = String(inviteCode).trim();
        for (const doc of qsnap.docs) {
          const classroom = doc.data();
          const codeValue =
            typeof classroom.code === 'string'
              ? classroom.code
              : classroom.code?.['en-US'];

          if (
            codeValue &&
            want &&
            codeValue.localeCompare(want, undefined, {
              sensitivity: 'base',
            }) === 0
          ) {
            // return in db.list format:  { docId: classroomData }
            return res.status(200).json({
              [doc.id]: classroom,
            });
          }
        }

        return res.status(404).json({});
      }
      const { uid } = req.user;
      const qsnap = await admin
        .firestore()
        .collection('classrooms')
        .where('teacherId', '==', uid)
        .get();

      const result = {};
      qsnap.forEach((doc) => {
        result[doc.id] = doc.data();
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('GET /classrooms list error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // FIND classroom by invite code
  router.get('/byInviteCode', async (req, res) => {
    try {
      const inviteCode = req.query.code;
      if (!inviteCode) {
        return res.status(400).json({ message: 'Missing invite code' });
      }

      const qsnap = await admin.firestore().collection('classrooms')
        .get();

      const want = String(inviteCode).trim();
      for (const doc of qsnap.docs) {
        const classroom = doc.data();

        const codeValue =
          typeof classroom.code === 'string'
            ? classroom.code
            : classroom.code?.['en-US'];

        if (
          codeValue &&
          want &&
          codeValue.localeCompare(want, undefined, { sensitivity: 'base' }) ===
            0
        ) {
          return res.status(200).json({ id: doc.id, ...classroom });
        }
      }

      return res.status(404).json({ message: 'Invalid invite code' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

  // PATCH (classroom update)
  // Firestore merge:true recursively merges maps, so nested fields like
  // classroomAssignments.*.assignedTo and studentIds.*.assignments never drop
  // removed keys when the client sends a smaller object. Teachers send the full
  // classroom from the client after edits, so we replace the document for them.
  router.patch('/:id', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      const docRef = admin.firestore().collection('classrooms')
        .doc(id);
      const snap = await docRef.get();
      if (!snap.exists) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      const existing = snap.data();
      const payload = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const isOwner = existing.teacherId === uid;
      await docRef.set(payload, { merge: !isOwner });
      return res.sendStatus(204);
    } catch (err) {
      console.error('PATCH /classrooms error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      await colPath(uid).doc(id)
        .delete();
      return res.sendStatus(204);
    } catch (err) {
      console.error('DELETE /classrooms error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Assign assignment to students
  router.post('/:id/assign', async (req, res) => {
    try {
      void req.user;
      void req.params;
      void req.body;
      return res.status(501).json({ message: 'Not implemented' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

  // Delete assignment from classroom
  router.delete('/', async (req, res) => {
    try {
      void req.user;
      void req.query;
      return res.status(501).json({ message: 'Not implemented' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

  return router;
};
