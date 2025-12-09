/* eslint-env node */
const express = require("express");
const admin = require("firebase-admin");

module.exports = function createProjectsRouter(firebaseTokenManager) {
  const router = express.Router();

  // Ensure Admin is initialized once
  if (!admin.apps.length) {
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

  const colPath = () => admin.firestore().collection("projects");

  router.get("/", async (req, res) => {
    console.log("GET /projects called");
    try {
      const { uid } = req.user;
      console.log("router user uid:", uid);
      const doc = await admin
        .firestore()
        .collection("user")
        .doc(uid)
        .collection("projects")
        .get();
      const projects = {};
      doc.forEach((d) => {
        projects[d.id] = d.data();
      });
      console.log("fetched projects:", doc.size);
      return res.status(200).json(projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/:id", async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const data = req.body || {};
      const firestore = admin.firestore();
      const projectData = {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await firestore
        .collection("user")
        .doc(uid)
        .collection("projects")
        .doc(id)
        .set(projectData);

      console.log("Created project:", id, projectData);
      return res.status(204).json({ id, ...projectData });
    } catch (err) {
      console.error("Error creating project:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
