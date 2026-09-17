const { messaging } = require('./firebaseAdmin');

async function sendPushNotification({
  token,
  title,
  body,
  data = {},
}) {
  if (!token) {
    throw new Error('FCM token is required');
  }

  const message = {
    token,

    notification: {
      title,
      body,
    },

    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        String(value),
      ])
    ),
  };

  const response = await messaging.send(message);

  console.log(
    'FCM notification sent successfully:',
    response
  );

  return response;
}

module.exports = {
  sendPushNotification,
};