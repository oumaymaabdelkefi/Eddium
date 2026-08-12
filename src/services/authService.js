import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc,
  updateDoc, arrayUnion,
  serverTimestamp, collection,
  addDoc, query, orderBy,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ── Register ──────────────────────────────────────────────
export async function registerUser(email, password, username) {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    const user = credential.user;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        userId:        user.uid,
        username:      username,
        email:         email,
        level:         1,
        xp:            0,
        xpToNextLevel: 100,
        wordsLearned:  [],
        role:          'player',
        createdAt:     serverTimestamp(),
      });
    } catch (e) {
      console.log('Firestore error:', e.message);
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ── Login ─────────────────────────────────────────────────
export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth, email, password
    );
    return { success: true, user: credential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ── Logout ────────────────────────────────────────────────
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ── Update Progress ───────────────────────────────────────
export async function updateUserProgress(userId, xpEarned, wordsLearned, battleResult) {
  try {
    const userRef  = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false };

    const data      = userSnap.data();
    const currentXP = data.xp || 0;
    const newXP     = currentXP + xpEarned;
    const currLevel = data.level || 1;
    const xpToNext  = data.xpToNextLevel || 100;

    let newLevel    = currLevel;
    let newXpToNext = xpToNext;
    if (newXP >= xpToNext) {
      newLevel    = currLevel + 1;
      newXpToNext = xpToNext + 100;
    }

    // ── Single updateData declaration ──────────────────
    const updateData = {
      xp:            newXP,
      level:         newLevel,
      xpToNextLevel: newXpToNext,
    };

    // Only add words if there are real non-empty words
    const validWords = wordsLearned.filter(w => w && w.trim() !== '');
    if (validWords.length > 0) {
      updateData.wordsLearned = arrayUnion(...validWords);
    }

    await updateDoc(userRef, updateData);

    console.log("🔥 FIRESTORE WRITE COMPLETED");

    const verifySnap = await getDoc(userRef);

    console.log(
      "🔥 FIRESTORE AFTER WRITE:",
      verifySnap.exists() ? verifySnap.data() : "DOCUMENT DOES NOT EXIST"
    );

    // Save battle to subcollection
    await addDoc(
      collection(db, 'users', userId, 'battles'),
      {
        score:        battleResult.score,
        total:        battleResult.total,
        xpEarned:     xpEarned,
        wordsLearned: validWords,
        date:         serverTimestamp(),
      }
    );

    return {
      success:   true,
      newXP,
      newLevel,
      leveledUp: newLevel > currLevel,
    };
  } catch (error) {
    console.log('updateUserProgress error:', error.message);
    return { success: false };
  }
}

// ── Fetch Battle History ──────────────────────────────────
export async function fetchBattleHistory(userId) {
  try {
    const q = query(
      collection(db, 'users', userId, 'battles'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    const battles = [];
    snapshot.forEach(doc => {
      battles.push({ id: doc.id, ...doc.data() });
    });
    return battles;
  } catch (error) {
    console.log('fetchBattleHistory error:', error.message);
    return [];
  }
}

// ── Error Messages ────────────────────────────────────────
export function getErrorMessage(error) {
  if (error.includes('user-not-found'))       return 'No account found with this email';
  if (error.includes('wrong-password'))       return 'Incorrect password';
  if (error.includes('invalid-email'))        return 'Invalid email address';
  if (error.includes('invalid-credential'))   return 'Incorrect email or password';
  if (error.includes('too-many-requests'))    return 'Too many attempts. Try again later';
  if (error.includes('email-already-in-use')) return 'An account already exists with this email';
  if (error.includes('weak-password'))        return 'Password must be at least 6 characters';
  return 'Something went wrong. Please try again';
}