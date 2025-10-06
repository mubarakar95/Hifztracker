'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseClientProvider as FirebaseClientContextProvider } from './provider';

// This component ensures that Firebase is initialized only once on the client.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseClientContextProvider value={firebaseServices}>
      {children}
    </FirebaseClientContextProvider>
  );
}
