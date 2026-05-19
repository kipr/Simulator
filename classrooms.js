/* eslint-env node */
const express = require('express');
const admin = require('firebase-admin');

function studentEntryId(entry) {
  if (!entry) return undefined;
  if (typeof entry === 'string') return entry;
  if (!entry.id) return undefined;
  if (typeof entry.id === 'string') return entry.id;
  if (typeof entry.id === 'object' && entry.id['en-US']) return entry.id['en-US'];
  return undefined;
}

/** Firestore map key for a student (may differ from entry.id in edge cases). */
function findStudentRosterKey(studentIds, studentId) {
  if (!studentIds || typeof studentIds !== 'object' || Array.isArray(studentIds)) {
    return null;
  }
  if (studentIds[studentId]) return studentId;
  for (const [key, entry] of Object.entries(studentIds)) {
    if (key === studentId || studentEntryId(entry) === studentId) {
      return key;
    }
  }
  return null;
}

/** All roster map keys that refer to this student (removes duplicates / legacy keys). */
function rosterKeysForStudent(studentIds, studentId) {
  if (!studentIds || typeof studentIds !== 'object' || Array.isArray(studentIds)) {
    return [];
  }
  const keys = new Set();
  for (const [key, entry] of Object.entries(studentIds)) {
    if (key === studentId || studentEntryId(entry) === studentId) {
      keys.add(key);
    }
  }
  return [...keys];
}

/** Firestore update() deep-merges maps; assignedTo keys must be deleted explicitly. */
function addAssignedToDeletesForStudent(update, classroomAssignments, studentId) {
  if (!classroomAssignments || typeof classroomAssignments !== 'object') {
    return;
  }
  const FieldPath = admin.firestore.FieldPath;
  for (const [assignmentKey, assignment] of Object.entries(classroomAssignments)) {
    const assignedTo = assignment?.assignedTo;
    if (!assignedTo || typeof assignedTo !== 'object') continue;
    for (const [assignedKey, entry] of Object.entries(assignedTo)) {
      if (assignedKey === studentId || studentEntryId(entry) === studentId) {
        update[
          new FieldPath('classroomAssignments', assignmentKey, 'assignedTo', assignedKey)
        ] = admin.firestore.FieldValue.delete();
      }
    }
  }
}

/** Apply assignment map patch without leaving stale assignedTo entries after merge. */
async function applyClassroomAssignmentsPatch(docRef, existing, incomingAssignments) {
  const FieldPath = admin.firestore.FieldPath;
  const existingAssignments = existing.classroomAssignments || {};
  const incoming = incomingAssignments || {};
  const update = {};
  const assignmentKeys = new Set([
    ...Object.keys(existingAssignments),
    ...Object.keys(incoming),
  ]);

  for (const assignmentKey of assignmentKeys) {
    const existingAssignment = existingAssignments[assignmentKey];
    const incomingAssignment = incoming[assignmentKey];
    const existingAt = existingAssignment?.assignedTo || {};
    const incomingAt = incomingAssignment?.assignedTo || {};

    for (const assignedKey of Object.keys(existingAt)) {
      if (!(assignedKey in incomingAt)) {
        update[
          new FieldPath('classroomAssignments', assignmentKey, 'assignedTo', assignedKey)
        ] = admin.firestore.FieldValue.delete();
      }
    }
    for (const [assignedKey, entry] of Object.entries(incomingAt)) {
      update[
        new FieldPath('classroomAssignments', assignmentKey, 'assignedTo', assignedKey)
      ] = entry;
    }

    if (incomingAssignment) {
      const rest = { ...incomingAssignment };
      delete rest.assignedTo;
      for (const [field, value] of Object.entries(rest)) {
        update[new FieldPath('classroomAssignments', assignmentKey, field)] = value;
      }
    }
  }

  if (Object.keys(update).length === 0) return;
  update.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await docRef.update(update);
}

/** Delete roster entry and remove student from every assignment's assignedTo. */
async function removeStudentFromClassroomDoc(docRef, existing, studentId) {
  const keys = rosterKeysForStudent(existing.studentIds, studentId);
  if (keys.length === 0) return false;
  const update = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  for (const key of keys) {
    update[`studentIds.${key}`] = admin.firestore.FieldValue.delete();
  }
  addAssignedToDeletesForStudent(update, existing.classroomAssignments, studentId);
  await docRef.update(update);
  return true;
}

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

  // Student leaves whichever classroom they are enrolled in (uses auth uid; no doc id required).
  router.post('/leave', async (req, res) => {
    try {
      const { uid } = req.user;
      let qsnap = await colPath()
        .where(`studentIds.${uid}`, '!=', null)
        .get();

      // Legacy rosters may use a map key other than the uid; scan once if the index query misses.
      if (qsnap.empty) {
        const all = await colPath().get();
        const matches = all.docs.filter((doc) =>
          rosterKeysForStudent(doc.data().studentIds, uid).length > 0,
        );
        if (matches.length > 0) {
          qsnap = { docs: matches, empty: false };
        }
      }

      if (qsnap.empty) {
        return res.status(404).json({ message: 'Student not in any classroom' });
      }

      let removed = false;
      for (const doc of qsnap.docs) {
        const existing = doc.data();
        const didRemove = await removeStudentFromClassroomDoc(doc.ref, existing, uid);
        if (didRemove) removed = true;
      }

      if (!removed) {
        return res.status(404).json({ message: 'Student not in classroom' });
      }
      return res.sendStatus(204);
    } catch (err) {
      console.error('POST /classrooms/leave error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // CREATE classroom (POST on an existing id must not reassign teacherId to the caller)
  router.post('/:id', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      const firestore = admin.firestore();
      const docRef = firestore.collection('classrooms').doc(id);
      const existingSnap = await docRef.get();

      if (existingSnap.exists) {
        const existing = existingSnap.data();
        const dataWithoutTeacherId = { ...data };
        delete dataWithoutTeacherId.teacherId;
        await docRef.set(
          {
            ...dataWithoutTeacherId,
            teacherId: existing.teacherId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return res.sendStatus(204);
      }

      const classroomData = {
        ...data,
        teacherId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.set(classroomData);

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
      qsnap.forEach((doc) => {
        result[doc.id] = { ...doc.data(), docId: doc.id };
      });

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

      return res.status(200).json({ [id]: { ...doc.data(), docId: id } });
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
        result[doc.id] = { ...doc.data(), docId: doc.id };
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

  // Student leaves their own classroom (caller uid only; never touches teacherId).
  router.post('/:id/leave', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const docRef = admin.firestore()
        .collection('classrooms')
        .doc(id);
      const snap = await docRef.get();
      if (!snap.exists) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      const existing = snap.data();
      const didRemove = await removeStudentFromClassroomDoc(docRef, existing, uid);
      if (!didRemove) {
        return res.status(404).json({ message: 'Student not in classroom' });
      }
      return res.sendStatus(204);
    } catch (err) {
      console.error('POST /classrooms/:id/leave error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Remove one student from the roster (leave classroom / teacher removes student).
  // Never reads or writes teacherId.
  router.delete('/:id/students/:studentId', async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, studentId } = req.params;
      const docRef = admin.firestore()
        .collection('classrooms')
        .doc(id);
      const snap = await docRef.get();
      if (!snap.exists) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      const existing = snap.data();
      const isTeacher = existing.teacherId === uid;
      const isSelf = studentId === uid;
      if (!isTeacher && !isSelf) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const didRemove = await removeStudentFromClassroomDoc(
        docRef,
        existing,
        studentId,
      );
      if (!didRemove) {
        return res.status(404).json({ message: 'Student not in classroom' });
      }
      return res.sendStatus(204);
    } catch (err) {
      console.error('DELETE /classrooms/:id/students/:studentId error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  const isRosterOnlyPatch = (data) => {
    const keys = Object.keys(data).filter((k) => k !== 'updatedAt');
    return (
      keys.length === 1 &&
      keys[0] === 'studentIds' &&
      data.studentIds &&
      typeof data.studentIds === 'object'
    );
  };

  const isRosterAndAssignmentsPatch = (data) => {
    const keys = Object.keys(data).filter((k) => k !== 'updatedAt');
    return (
      keys.length === 2 &&
      keys.includes('studentIds') &&
      keys.includes('classroomAssignments') &&
      data.studentIds &&
      typeof data.studentIds === 'object' &&
      data.classroomAssignments &&
      typeof data.classroomAssignments === 'object'
    );
  };

  const applyRosterPatch = async (docRef, existing, data) => {
    const update = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const existingIds = existing.studentIds || {};
    const incomingIds = data.studentIds;

    for (const [studentId, entry] of Object.entries(incomingIds)) {
      update[`studentIds.${studentId}`] = entry;
    }
    for (const studentId of Object.keys(existingIds)) {
      if (!(studentId in incomingIds)) {
        update[`studentIds.${studentId}`] = admin.firestore.FieldValue.delete();
      }
    }

    await docRef.update(update);
  };

  /** Non-teacher roster PATCH: may only join (add self) or leave (remove self). */
  const applyStudentRosterPatchAsNonTeacher = async (docRef, existing, data, uid) => {
    const existingIds = existing.studentIds || {};
    const incomingIds = data.studentIds || {};
    const selfKey = findStudentRosterKey(existingIds, uid);
    const addedKeys = Object.keys(incomingIds).filter((k) => !(k in existingIds));
    const removedKeys = Object.keys(existingIds).filter((k) => !(k in incomingIds));

    const forbidden = () => {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    };

    // Join: preserve roster, add only the authenticated student.
    if (removedKeys.length === 0 && addedKeys.length === 1 && addedKeys[0] === uid) {
      for (const key of Object.keys(existingIds)) {
        if (!(key in incomingIds)) forbidden();
      }
      await docRef.update({
        [`studentIds.${uid}`]: incomingIds[uid],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return;
    }

    // Leave: preserve roster for everyone else, remove only the authenticated student.
    if (addedKeys.length === 0 && removedKeys.length === 1) {
      const removedKey = removedKeys[0];
      if (
        removedKey !== uid &&
        removedKey !== selfKey &&
        studentEntryId(existingIds[removedKey]) !== uid
      ) {
        forbidden();
      }
      for (const key of Object.keys(existingIds)) {
        if (key === removedKey) continue;
        if (!(key in incomingIds)) forbidden();
      }
      for (const key of Object.keys(incomingIds)) {
        if (!(key in existingIds)) forbidden();
      }
      await removeStudentFromClassroomDoc(docRef, existing, uid);
      return;
    }

    forbidden();
  };

  // PATCH (classroom update)
  // Firestore merge:true recursively merges maps, so nested fields like
  // classroomAssignments.*.assignedTo and studentIds.*.assignments never drop
  // removed keys when the client sends a smaller object. Teachers send the full
  // classroom from the client after edits, so we replace the document for them.
  // Roster-only patches (studentIds only) never change teacherId — even if
  // teacherId was previously corrupted to match a student's uid.
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
      const isOwner = existing.teacherId === uid;

      if (isRosterAndAssignmentsPatch(data) && isOwner) {
        await applyRosterPatch(docRef, existing, { studentIds: data.studentIds });
        await applyClassroomAssignmentsPatch(
          docRef,
          existing,
          data.classroomAssignments,
        );
        return res.sendStatus(204);
      }

      if (isRosterOnlyPatch(data)) {
        if (isOwner) {
          await applyRosterPatch(docRef, existing, data);
        } else {
          try {
            await applyStudentRosterPatchAsNonTeacher(docRef, existing, data, uid);
          } catch (err) {
            if (err.status === 403) {
              return res.status(403).json({ message: 'Forbidden' });
            }
            if (err.status === 404) {
              return res.status(404).json({ message: err.message });
            }
            throw err;
          }
        }
        return res.sendStatus(204);
      }

      if (isOwner) {
        const dataWithoutTeacherId = { ...data };
        delete dataWithoutTeacherId.teacherId;
        const payload = {
          ...dataWithoutTeacherId,
          teacherId: existing.teacherId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await docRef.set(payload, { merge: false });
        return res.sendStatus(204);
      }

      return res.status(403).json({ message: 'Forbidden' });
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
