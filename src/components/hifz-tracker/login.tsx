
"use client";

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { BookOpen, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function Login() {
  const { auth, user, isUserLoading } = useFirebase();
  const [isSigningIn, setIsSigningIn] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsSigningIn(false);
      return;
    }

    if (user) {
      setIsSigningIn(false);
      return;
    }
    
    // This effect runs on mount to check if the user is returning from a redirect.
    getRedirectResult(auth)
      .then((result) => {
        // If result is null, it means the user just landed on the page without
        // having been redirected from Google. If it's not null, the onAuthStateChanged
        // listener in our FirebaseProvider will handle the user state update.
        // In either case, we can stop showing the "Signing in..." message.
        setIsSigningIn(false);
      })
      .catch((error) => {
        console.error("Error during sign-in redirect:", error);
        setIsSigningIn(false);
      });
  }, [auth, user]);

  const handleGoogleSignIn = () => {
    if (!auth || isSigningIn) return;
    
    const provider = new GoogleAuthProvider();
    setIsSigningIn(true);
    // We initiate the redirect. After the user signs in with Google, they'll be
    // sent back here, and the useEffect hook above will handle the result.
    signInWithRedirect(auth, provider).catch(error => {
       console.error("Error initiating redirect sign in: ", error);
       setIsSigningIn(false);
    });
  };
  
  // Show a loading screen while the initial user check is happening,
  // or while we are actively processing a sign-in redirect.
  if (isUserLoading || isSigningIn) {
      return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Signing in...</p>
      </div>
    );
  }

  // If we're done loading and there's still no user, show the login button.
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
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
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
