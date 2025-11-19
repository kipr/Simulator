/* eslint-env node */
const express = require("express");
const admin = require("firebase-admin");

// You already have FirebaseTokenManager; we’ll use it to verify the ID token.
module.exports = function createClassroomsRouter(firebaseTokenManager) {
  const router = express.Router();

  // Ensure Admin is initialized once
  if (!admin.apps.length) {
    // If you already init admin elsewhere, remove this init block.
    admin.initializeApp({
      credential: admin.credential.cert(
        firebaseTokenManager.serviceAccountKey || {}
      ),
    });
  }

  router.use((req, res, next) => {
    console.log("Incoming Authorization header:", req.headers.authorization);
    next();
  });

  // Auth middleware: decode Firebase token into req.user
  router.use(async (req, res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token)
        return res.status(401).json({ message: "Missing bearer token" });

      const decoded = await firebaseTokenManager.verifyIdToken(token);
      req.user = { uid: decoded.uid };
      next();
    } catch (e) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  const colPath = () => admin.firestore().collection("classrooms");

  // CREATE classroom
  router.post("/:id", async (req, res) => {
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

      await firestore.collection("classrooms").doc(id).set(classroomData);

      console.log("Created classroom:", id, classroomData);
      return res.status(204).json({ id, ...classroomData });
    } catch (err) {
      console.error("POST /classrooms/ error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // GET student in classroom challenges
  router.get("/:id/challenges", async (req, res) => {
    try {
      console.log("GET /:id/challenges called");
      const { id } = req.params;
      const qsnap = await admin
        .firestore()
        .collection("user")
        .doc(id)
        .collection("challenge_completion")
        .get();
      const result = {};
      qsnap.forEach((doc) => {
        result[doc.id] = doc.data();
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("GET /classrooms list error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // GET all students in classroom challenges
  router.get("/challenges", async (req, res) => {
    try {
      const studentIds = req.query.studentId || [];
      console.log("studentIds:", studentIds);
      const result = {};
      console.log("GET /classroom/challenges called");

      for (const studentId of studentIds) {
        const qsnap = await admin
          .firestore()
          .collection("user")
          .doc(studentId)
          .collection("challenge_completion")
          .get();

        result[studentId] = qsnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      }

      console.log("GET /classroom/challenges result:", result);
      return res.status(200).json(result);
    } catch (err) {
      console.error("GET /classrooms list error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // READ one classroom
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await admin
        .firestore()
        .collection("classrooms")
        .doc(id)
        .get();

      if (!doc.exists) {
        return res.status(404).json({});
      }

      return res.status(200).json({ [id]: doc.data() });
    } catch (err) {
      console.error("GET /classrooms/:id error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // LIST classrooms (owned by this user)
  router.get("/", async (req, res) => {
    try {
      const { uid } = req.user;
      const qsnap = await admin
        .firestore()
        .collection("classrooms")
        .where("teacherId", "==", uid)
        .get();

      const result = {};
      qsnap.forEach((doc) => {
        result[doc.id] = doc.data();
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error("GET /classrooms list error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // PATCH (partial update)
  router.patch("/:id", async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      await colPath(uid)
        .doc(id)
        .set(
          {
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      return res.sendStatus(204);
    } catch (err) {
      console.error("PATCH /classrooms error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    console.log("DELETE /:id called");
    try {
      const { uid } = req.user;
      const { id } = req.params;
      await colPath(uid).doc(id).delete();
      return res.sendStatus(204);
    } catch (err) {
      console.error("DELETE /classrooms error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  return router;
};
