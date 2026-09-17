const {
  initializeApp,
  cert,
  getApps,
} = require('firebase-admin/app');

const {
  getMessaging,
} = require('firebase-admin/messaging');

const {
  getFirestore,
} = require('firebase-admin/firestore');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
        /\\n/g,
        '\n'
      ),
    }),
  });
}

const messaging = getMessaging();
const firestore = getFirestore();

console.log('Firebase Admin initialized successfully');

module.exports = {
  messaging,
  firestore,
};