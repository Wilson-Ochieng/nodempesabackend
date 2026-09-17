const { firestore } = require('./firebaseAdmin');

async function getUserFcmToken(uid) {
  if (!uid) {
    throw new Error('User UID is required');
  }

  const userDoc = await firestore
    .collection('users')
    .doc(uid)
    .get();

  if (!userDoc.exists) {
    console.log(
      `User not found in Firestore: ${uid}`
    );

    return null;
  }

  const userData = userDoc.data();

  return userData.fcmToken || null;
}

module.exports = {
  getUserFcmToken,
};