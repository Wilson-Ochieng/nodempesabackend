const express = require('express');

const {
  sendTestNotification,
  sendUserTestNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.post(
  '/test',
  sendTestNotification
);

router.post(
  '/user-test',
  sendUserTestNotification
);

module.exports = router;