import { BookOpen } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold">Hifz Tracker</h1>
      </div>
    </header>
  );
}
