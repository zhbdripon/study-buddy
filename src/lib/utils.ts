import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function urlToQualifiedId(url: string) {
  try {
    const parsed = new URL(url);

    // Combine hostname and path
    const host = parsed.hostname.replace(/\./g, "_");
    const path = parsed.pathname.replace(/[^a-zA-Z0-9]/g, "_");

    // Remove leading/trailing underscores, collapse multiple underscores
    const qualifiedId = `${host}${path}`
      .replace(/_+/g, "_") // Collapse multiple underscores
      .replace(/^_+|_+$/g, "") // Trim leading/trailing underscores
      .toLowerCase();

    return qualifiedId;
  } catch (e) {
    console.error("Invalid URL:", url, e);
    throw new Error(`Invalid URL: ${url}`);
  }
}

export function getFormattedDateAndTime(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit,
  maxRetries = 2,
) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const res = await fetch(input, init);

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
