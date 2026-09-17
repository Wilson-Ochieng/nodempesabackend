const {
  sendPushNotification,
} = require('../services/notificationService');

const {
  getUserFcmToken,
} = require('../services/userService');

async function sendTestNotification(req, res) {
  try {
    const {
      token,
      title,
      body,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    const messageId =
      await sendPushNotification({
        token,
        title: title || 'Duka Letu',
        body:
          body ||
          'This is a test notification from Duka Letu.',
        data: {
          type: 'test',
        },
      });

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      messageId,
    });
  } catch (error) {
    console.error(
      'FCM notification error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
}

async function sendUserTestNotification(req, res) {
  try {
    const {
      uid,
      title,
      body,
    } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User UID is required',
      });
    }

    const token =
      await getUserFcmToken(uid);

    if (!token) {
      return res.status(404).json({
        success: false,
        message:
          'No FCM token found for this user',
      });
    }

    const messageId =
      await sendPushNotification({
        token,
        title:
          title || 'Duka Letu',
        body:
          body ||
          'This notification was sent using your Firestore FCM token.',
        data: {
          type: 'user_test',
        },
      });

    return res.status(200).json({
      success: true,
      message:
        'Notification sent successfully',
      messageId,
    });
  } catch (error) {
    console.error(
      'User FCM notification error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to send user notification',
      error: error.message,
    });
  }
}

module.exports = {
  sendTestNotification,
  sendUserTestNotification,
};