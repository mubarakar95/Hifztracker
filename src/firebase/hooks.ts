
import { useMemo, type DependencyList } from 'react';

export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList
): T extends object ? T & { __memo?: boolean } : T {
  const out = useMemo(factory, deps) as T & { __memo?: boolean };
  if (out && typeof out === 'object') {
    out.__memo = true;
  }
  return out;
}
