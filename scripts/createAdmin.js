const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
} = require('firebase/auth');
const {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            "AIzaSyA5skjK3WPuGKk5VyziVF_g1dqD9rE_zEY",
  authDomain:        "eddium-fa34a.firebaseapp.com",
  projectId:         "eddium-fa34a",
  storageBucket:     "eddium-fa34a.firebasestorage.app",
  messagingSenderId: "437321697658",
  appId:             "1:437321697658:web:f48dc3e713d53b48156ec3",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app, 'default');

// ── Admin credentials — change these ─────────────────────
const ADMIN_EMAIL    = 'admin@eddium.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_USERNAME = 'Eddium Admin';

async function createAdmin() {
  try {
    console.log('Creating admin account...');

    // Step 1 — Create Firebase Auth account
    const credential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    const uid = credential.user.uid;
    console.log('✓ Auth account created:', uid);

    // Step 2 — Create Firestore document with role: admin
    await setDoc(doc(db, 'users', uid), {
      userId:        uid,
      username:      ADMIN_USERNAME,
      email:         ADMIN_EMAIL,
      level:         1,
      xp:            0,
      xpToNextLevel: 100,
      wordsLearned:  [],
      role:          'admin',
      createdAt:     serverTimestamp(),
    });
    console.log('✓ Firestore document created');

    console.log('');
    console.log('Admin account ready:');
    console.log('Email:   ', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Role:     admin');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✗ Email already exists — admin already created');
    } else {
      console.log('✗ Error:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();