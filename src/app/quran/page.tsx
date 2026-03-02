'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects any leftover attempts to visit /quran back to the dashboard.
 */
export default function QuranPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Dashboard...</p>
    </div>
  );
}
