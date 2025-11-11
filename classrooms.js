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

  // CREATE / UPSERT classroom
  router.post("/:id", async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      await colPath(uid)
        .doc(id)
        .set(
          {
            ...data,
            teacherId: uid, // optional convenience field
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      return res.sendStatus(204);
    } catch (err) {
      console.error("POST /classrooms error:", err);
      return res.status(500).json({ message: err.message });
    }
  });

  // READ one classroom
  router.get("/:id", async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const snap = await colPath(uid).doc(id).get();
      if (!snap.exists) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(snap.data());
    } catch (err) {
      console.error("GET /classrooms error:", err);
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
