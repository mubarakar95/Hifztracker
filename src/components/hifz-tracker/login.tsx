
"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { BookOpen, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
  const { auth, isAuthReady, isUserLoading } = useFirebase();
  const [isSigningIn, setIsSigningIn] = useState(true);

  // This effect handles the result of the redirect sign-in
  useEffect(() => {
    if (isAuthReady && auth) {
      getRedirectResult(auth)
        .then((result) => {
          // If result is null, it means the user just landed on the page and is not
          // coming from a redirect. The onAuthStateChanged listener in FirebaseProvider
          // will handle the user state. We can stop showing the loader.
          // If a result is returned, onAuthStateChanged will also fire and handle the state.
        })
        .catch((error) => {
          console.error("Error getting redirect result: ", error);
        })
        .finally(() => {
          // No matter the outcome, we are done with the redirect check.
          setIsSigningIn(false);
        });
    } else {
       // If auth isn't ready, we might be in the middle of the initial load.
       // We rely on the isUserLoading flag from useFirebase to show a global loader.
       // But if we are here, we can assume the redirect check isn't active yet.
       setIsSigningIn(false);
    }
  }, [auth, isAuthReady]);

  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsSigningIn(true); // Show loader immediately on click
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch(error => {
       console.error("Error initiating redirect sign in: ", error);
       setIsSigningIn(false); // If initiation fails, hide loader
    });
  };

  // While waiting for the redirect result to be processed, show a loader.
  // Also rely on the global isUserLoading state.
  if (isSigningIn || isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Signing in...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Welcome to Hifz Tracker
          </CardTitle>
          <CardDescription>
            Sign in to track your Quran memorization journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.4 64.8C317.3 99.6 283.7 84 248 84c-84.3 0-152.3 67.8-152.3 151.7s68 151.7 152.3 151.7c99.1 0 129.2-80.3 132.3-118.1H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
