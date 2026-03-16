/* eslint-env node */
const express = require('express');
const admin = require('firebase-admin');
// import TourDoc from '/tours/Tours';

module.exports = function createGuidedTourRouter(firebaseTokenManager) {
  const router = express.Router();
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
  // GET guided tour status for user
  router.get('/:tourId', async (req, res) => {
    const { uid } = req.user;
    const { tourId } = req.params;
    const snaps = await admin
      .firestore()
      .collection('user')
      .doc(uid)
      .collection('tours')
      .doc(tourId)
      .get();

    const existing = snaps.exists ? snaps.data() : {};
    return res.status(200).json(existing);
  });

  router.patch('/:tourId', async (req, res) => {
    const uid = req.body.uid || req.user.uid;
    const { tourId } = req.params;
    const data = req.body || {};
    try {
      await admin
        .firestore()
        .collection('user')
        .doc(uid)
        .collection('tours')
        .doc(tourId)
        .set(data, { merge: true });

      return res.status(204).json({});
    } catch (err) {
      console.error('Error updating tour status:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
