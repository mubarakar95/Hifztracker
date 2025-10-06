
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useFirebaseClient } from './client-provider';

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  isAuthReady: boolean;
  isVerifyingRedirect: boolean;
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
  const firebaseServices = useFirebaseClient(); // Get stable services from client-provider
  const { firebaseApp, firestore, auth } = firebaseServices || {};

  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start with user loading, as we need to check both redirect and auth state.
    isAuthReady: false,
    isVerifyingRedirect: true, // Start in a verifying state
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({ user: null, isUserifyingRedirect: false, isUserLoading: false, isAuthReady: true, userError: new Error("Auth service not available.") });
      return;
    }

    // This effect runs once on mount to handle both the redirect result
    // and set up the permanent auth state listener.
    const processAuth = async () => {
      try {
        // First, check for the redirect result. This is critical for the redirect flow.
        // It will resolve with the user if the redirect was successful, or null otherwise.
        await getRedirectResult(auth);
        // We don't need to do anything with the result directly, because onAuthStateChanged
        // will fire with the correct user state *after* this promise resolves.
      } catch (error) {
        console.error("Error processing redirect result:", error);
        setUserState(prevState => ({ ...prevState, userError: error as Error }));
      } finally {
        // Once the redirect result has been processed (or if there was none),
        // we can stop the redirect verification state.
        setUserState(prevState => ({ ...prevState, isVerifyingRedirect: false }));
      }
      
      // After handling the potential redirect, set up the onAuthStateChanged listener.
      // This will be our source of truth for the user's auth state going forward.
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          // When this fires, Firebase has settled the auth state.
          setUserState(prevState => ({ ...prevState, user, isUserLoading: false, isAuthReady: true, userError: null }));
        },
        (error) => {
          setUserState(prevState => ({ ...prevState, user: null, isUserLoading: false, isAuthReady: true, userError: error }));
        }
      );

      return unsubscribe;
    };
    
    let unsubscribe: (() => void) | undefined;
    processAuth().then(unsub => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
    isVerifyingRedirect: context.isVerifyingRedirect,
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
    isVerifyingRedirect: context.isVerifyingRedirect,
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