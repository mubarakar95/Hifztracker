
"use client";

import { QuranHeader } from "@/components/quran/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuranPage() {
  const totalPages = 604;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <QuranHeader />
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">
          Quran
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((page) => (
            <Card key={page}>
              <CardHeader>
                <CardTitle className="text-lg">Page {page}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Page content for {page}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
