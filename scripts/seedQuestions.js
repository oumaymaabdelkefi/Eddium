const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            "AIzaSyA5skjK3WPuGKk5VyziVF_g1dqD9rE_zEY",
  authDomain:        "eddium-fa34a.firebaseapp.com",
  projectId:         "eddium-fa34a",
  storageBucket:     "eddium-fa34a.firebasestorage.app",
  messagingSenderId: "437321697658",
  appId:             "1:437321697658:web:f48dc3e713d53b48156ec3",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app, 'default');

const questions = [
  {
    word: 'eloquent',
    question: 'What does ELOQUENT mean?',
    options: ['Unable to speak', 'Well-spoken and persuasive', 'Confused', 'Aggressive'],
    correctIndex: 1,
    difficulty: 'intermediate',
    category: 'IELTS',
    level: 1,
    xpReward: 20,
  },
  {
    word: 'tenacious',
    question: 'What does TENACIOUS mean?',
    options: ['Weak', 'Forgetful', 'Persistent and determined', 'Careless'],
    correctIndex: 2,
    difficulty: 'intermediate',
    category: 'IELTS',
    level: 1,
    xpReward: 20,
  },
  {
    word: 'concise',
    question: 'What does CONCISE mean?',
    options: ['Long and detailed', 'Brief and clear', 'Confusing', 'Emotional'],
    correctIndex: 1,
    difficulty: 'beginner',
    category: 'IELTS',
    level: 1,
    xpReward: 15,
  },
  {
    word: 'diligent',
    question: 'What does DILIGENT mean?',
    options: ['Lazy', 'Hardworking and careful', 'Reckless', 'Dishonest'],
    correctIndex: 1,
    difficulty: 'beginner',
    category: 'IELTS',
    level: 1,
    xpReward: 15,
  },
  {
    word: 'meticulous',
    question: 'What does METICULOUS mean?',
    options: ['Careless', 'Very careful about details', 'Quick', 'Artistic'],
    correctIndex: 1,
    difficulty: 'advanced',
    category: 'IELTS',
    level: 1,
    xpReward: 30,
  },
  {
    word: 'pragmatic',
    question: 'What does PRAGMATIC mean?',
    options: ['Idealistic', 'Dealing with things practically', 'Emotional', 'Theoretical'],
    correctIndex: 1,
    difficulty: 'advanced',
    category: 'IELTS',
    level: 1,
    xpReward: 30,
  },
  {
    word: 'persevere',
    question: 'What does PERSEVERE mean?',
    options: ['Give up easily', 'Continue despite difficulty', 'Move quickly', 'Think deeply'],
    correctIndex: 1,
    difficulty: 'intermediate',
    category: 'IELTS',
    level: 1,
    xpReward: 20,
  },
  {
    word: 'coherent',
    question: 'What does COHERENT mean?',
    options: ['Confusing', 'Logical and consistent', 'Emotional', 'Brief'],
    correctIndex: 1,
    difficulty: 'intermediate',
    category: 'IELTS',
    level: 1,
    xpReward: 20,
  },
  {
    word: 'diverse',
    question: 'What does DIVERSE mean?',
    options: ['All the same', 'Showing variety', 'Boring', 'Expensive'],
    correctIndex: 1,
    difficulty: 'beginner',
    category: 'IELTS',
    level: 1,
    xpReward: 15,
  },
];

async function seed() {
  console.log('Seeding 9 questions...');
  for (const q of questions) {
    try {
      const ref = await addDoc(collection(db, 'questions'), q);
      console.log(`✓ Added: ${q.word}`);
    } catch (error) {
      console.log(`✗ Failed: ${q.word}`, error.message);
    }
  }
  console.log('Done!');
  process.exit(0);
}

seed();