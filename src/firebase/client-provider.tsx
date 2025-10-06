'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Define the shape of the context value
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create a new context for the initialized Firebase services.
const FirebaseClientContext = createContext<FirebaseServices | null>(null);

/**
 * A client-side component that initializes Firebase and provides the service
 * instances to its children. This ensures that Firebase is initialized only
 * once in the browser.
 */
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useMemo ensures that initializeFirebase() is called only once.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseClientContext.Provider value={firebaseServices}>
      {children}
    </FirebaseClientContext.Provider>
  );
}

/**
 * A hook to access the initialized Firebase services from within the
 * FirebaseClientProvider.
 */
export function useFirebaseClient() {
  const context = useContext(FirebaseClientContext);
  if (!context) {
    throw new Error(
      'useFirebaseClient must be used within a FirebaseClientProvider'
    );
  }
  return context;
}
