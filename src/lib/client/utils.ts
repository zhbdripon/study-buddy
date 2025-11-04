import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit,
  maxRetries = 2,
) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (res.ok) {
      return res;
    }

    if (res.status === 400 || res.status === 401) {
      attempt++;

      if (attempt > maxRetries) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
        return null;
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    return res;
  }
}
