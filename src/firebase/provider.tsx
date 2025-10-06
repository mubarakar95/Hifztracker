
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// This context will be provided by the new FirebaseClientProvider
const FirebaseClientContext = createContext<{
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} | null>(null);

export const FirebaseClientProvider = FirebaseClientContext.Provider;

export function useFirebaseClient() {
  const context = useContext(FirebaseClientContext);
  if (!context) {
    throw new Error('useFirebaseClient must be used within a FirebaseClientProvider');
  }
  return context;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  isAuthReady: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends UserAuthState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Return type for useUser()
export interface UserHookResult extends UserAuthState {}

const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useFirebaseClient(); // Get stable services
  const { firebaseApp, firestore, auth } = firebaseServices || {};

  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    isAuthReady: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isUserLoading: false, isAuthReady: false, userError: new Error("Auth service not available.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserState({ user, isUserLoading: false, isAuthReady: true, userError: null });
      },
      (error) => {
        setUserState({ user: null, isUserLoading: false, isAuthReady: true, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const contextValue: FirebaseContextState = {
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp: firebaseApp || null,
    firestore: firestore || null,
    auth: auth || null,
    ...userState,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}


// Custom hook to access all Firebase services and user state.
export function useFirebase(): FirebaseServicesAndUser {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase services are not available. Check your FirebaseProvider setup.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    isAuthReady: context.isAuthReady,
    userError: context.userError,
  };
}

export function useUser(): UserHookResult {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    isAuthReady: context.isAuthReady,
    userError: context.userError,
  };
}


export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}

export * from './hooks';
