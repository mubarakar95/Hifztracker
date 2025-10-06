
"use client";

import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import Image from "next/image";
import { BookOpen, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import placeholderImage from "@/lib/placeholder-images.json";
import { useState, useEffect } from "react";


export function Login() {
  const { auth } = useFirebase();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to check for a redirect result.
    // This is the key to handling the state after returning from Google sign-in.
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          // If result is not null, a sign-in was successful.
          // The onAuthStateChanged listener in FirebaseProvider will handle updating the app's user state.
          // We don't need to do anything with the result here.
        })
        .catch((error) => {
          // Handle specific errors if necessary, e.g., account-exists-with-different-credential
          console.error("Error processing redirect result:", error);
        })
        .finally(() => {
          // No matter the outcome, the verification process is complete.
          // This allows the login UI to be shown if the sign-in was not successful.
          setIsVerifying(false);
        });
    } else {
        // If auth is not ready yet for some reason, we stop "verifying" to avoid an infinite loader.
        setIsVerifying(false);
    }
    // The empty dependency array ensures this effect runs only once on component mount.
  }, [auth]);


  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // We initiate the redirect. The useEffect above will handle the result when the user comes back.
    signInWithRedirect(auth, provider);
  };
  
  // While getRedirectResult is processing, it's crucial to show a loading screen.
  // This prevents the login UI from flashing before Firebase has confirmed the auth state.
  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Verifying your identity...</p>
      </div>
    );
  }

  // If we are done verifying and there's no user, show the actual login UI.
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">
                    Hifz Tracker
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
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={placeholderImage.login.src}
          alt={placeholderImage.login.alt}
          width={placeholderImage.login.width}
          height={placeholderImage.login.height}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="Quran book"
        />
      </div>
    </div>
  );
}
