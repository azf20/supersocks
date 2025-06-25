/**
 * Decodes a base64 SVG string into a usable SVG string
 * @param base64String - The base64 encoded SVG string
 * @returns The decoded SVG string or null if decoding fails
 */
export function decodeBase64SVG(base64String: string): string | null {
  try {
    // Check if it's a data URI
    if (base64String.startsWith("data:image/svg+xml;base64,")) {
      const base64Data = base64String.replace("data:image/svg+xml;base64,", "");
      return Buffer.from(base64Data, "base64").toString("utf-8");
    }
    // If it's just base64 without the data URI prefix
    if (base64String.startsWith("<svg")) {
      return base64String; // Already decoded
    }
    // Try to decode as base64
    const decoded = Buffer.from(base64String, "base64").toString("utf-8");
    if (decoded.startsWith("<svg")) {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("Error decoding SVG:", error);
    return null;
  }
}
