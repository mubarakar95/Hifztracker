
"use client";

import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import Image from "next/image";
import { BookOpen } from "lucide-react";
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


export function Login() {
  const { auth } = useFirebase();

  const handleGoogleSignIn = () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider).catch((error) => {
      console.error("Error initiating redirect sign in: ", error);
    });
  };

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
