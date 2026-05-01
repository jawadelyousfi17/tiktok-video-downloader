import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class strings while letting later classes win over earlier
 * ones. The clsx step lets callers pass conditional objects/arrays; twMerge
 * resolves conflicts (e.g. `px-2 px-4` collapses to `px-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
