import {
  collection, query, where,
  getDocs, limit, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function fetchQuestions(level = 1, category = 'IELTS', count = 5) {
  try {
    const q = query(
      collection(db, 'questions'),
      where('level', '==', level),
      where('category', '==', category),
      limit(count)
    );
    const snapshot = await getDocs(q);
    const questions = [];
    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    // Shuffle questions
    return questions.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.log('fetchQuestions error:', error.message);
    return [];
  }
}