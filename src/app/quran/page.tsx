
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuranPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page as the Quran section has been removed
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Dashboard...</p>
    </div>
  );
}
