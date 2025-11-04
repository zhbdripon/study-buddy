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

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
