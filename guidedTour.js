const express = require('express');
const admin = require('firebase-admin');

module.exports = function createGuidedTourRouter(firebaseTokenManager) {
  const router = express.Router();
  // GET guided tour status for user
  router.get('/', async (req, res) => {
    console.log('GET /guided-tour called');
    try {
      const { uid } = req.user;
      const doc = await admin.firestore().collection('users').doc(uid).get();
      const data = doc.data() || {};
      console.log('GET /classroom-guided-tour for user:', uid, 'data:', data);
      return res.json({
        completed: data.classroomGuidedTourCompleted || false,
      });
    } catch (err) {
      console.error('GET /guided-tour error:', err);
      return res.status(500).json({ message: err.message });
    }
  });

  return router;
};
