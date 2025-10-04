
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  isAuthReady: boolean; // New state to indicate if initial auth check is done
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  isAuthReady: boolean;
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  isAuthReady: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  isAuthReady: boolean;
  userError: Error | null;
}

const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export function FirebaseProvider({
  children,
  firebaseApp,
  firestore,
  auth,
}: FirebaseProviderProps) {
  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    isAuthReady: false, // Start as not ready
    userError: null,
  });

  useEffect(() => {
    // Set up the listener for authentication state changes.
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // First time this runs, auth is now "ready".
        setUserState({ user, isUserLoading: false, isAuthReady: true, userError: null });
      },
      (error) => {
        setUserState({ user: null, isUserLoading: false, isAuthReady: true, userError: error });
      }
    );

    // Unsubscribe from the listener when the component unmounts.
    return () => unsubscribe();
  }, [auth]); // The listener should re-subscribe if the auth instance changes.

  const contextValue: FirebaseContextState = {
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp,
    firestore,
    auth,
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

  // If services are not yet available, it's a critical error.
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

// Custom hook specifically for user authentication state.
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


// These hooks are useful if you only need one specific service instance
export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useMemoFirebase<T>(
    factory: () => T,
    deps: DependencyList,
): (T & {__memo?: boolean}) | undefined {
    const out = useMemo(factory, deps) as (T & {__memo?: boolean}) | undefined;
    if (out) {
        out.__memo = true;
    }
    return out;
}
