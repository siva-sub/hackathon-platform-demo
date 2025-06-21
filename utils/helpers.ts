
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const parseGeminiJsonResponse = <T,>(jsonString: string): T | null => {
  let cleanedJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanedJsonString.match(fenceRegex);
  if (match && match[2]) {
    cleanedJsonString = match[2].trim();
  }
  try {
    return JSON.parse(cleanedJsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error, "Raw string:", jsonString);
    return null;
  }
};
