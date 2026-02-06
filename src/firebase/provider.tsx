'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import type { UserProfile } from '@/lib/types';
import { auth, db } from './client';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  user: (UserProfile & { id: string }) | null;
  loading: boolean;
  signOut: () => Promise<void>;
  auth: any;
  db: any;
  firebaseUser: User | null;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(UserProfile & { id: string }) | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {}; // No-op function for cleanup

    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      // First, clean up any previous profile listener
      unsubscribeProfile();

      if (userAuth) {
        setFirebaseUser(userAuth);
        setLoading(true); // Start loading when auth state changes
        const userDocRef = doc(db, "users", userAuth.uid);
        
        // Set up a new real-time listener for the user's profile document
        unsubscribeProfile = onSnapshot(userDocRef, 
            (userDoc) => {
                if (userDoc.exists()) {
                    setUser({ id: userDoc.id, ...userDoc.data() } as UserProfile & { id: string });
                } else {
                    // Profile doesn't exist yet, user needs to complete it
                    setUser(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error listening to user document:", error);
                setUser(null);
                setLoading(false);
            }
        );
      } else {
        // User logged out
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup both auth and profile listeners on unmount
    return () => {
        unsubscribeAuth();
        unsubscribeProfile();
    };
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signOut, auth, db, firebaseUser }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
