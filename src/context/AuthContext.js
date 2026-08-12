import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let unsubSnap = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Listen to user document in real time
        unsubSnap = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              console.log('userData loaded — role:', data.role);
              setUserData(data);
            } else {
              setUserData({
                userId:        firebaseUser.uid,
                username:      'Student',
                email:         firebaseUser.email,
                level:         1,
                xp:            0,
                xpToNextLevel: 100,
                wordsLearned:  [],
                role:          'player',
              });
            }
            setLoading(false);
          },
          (error) => {
            console.log('Firestore error:', error.message);
            setUserData({
              userId:        firebaseUser.uid,
              username:      'Student',
              email:         firebaseUser.email,
              level:         1,
              xp:            0,
              xpToNextLevel: 100,
              wordsLearned:  [],
              role:          'player',
            });
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (unsubSnap) {
          unsubSnap();
          unsubSnap = null;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubSnap) unsubSnap();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}