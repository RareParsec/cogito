import admin from 'firebase-admin';

const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!firebaseKey) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set',
  );
}

const serviceAccount = JSON.parse(
  Buffer.from(firebaseKey, 'base64').toString(),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
