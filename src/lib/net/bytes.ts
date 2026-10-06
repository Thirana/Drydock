/** Byte helpers shared by the course widgets. */

/** 0-255 as two upper-case hex digits. */
export const hex = (byte: number) => byte.toString(16).padStart(2, "0").toUpperCase();

/** 4294967296 → "4,294,967,296". */
export const fmt = (n: number) => n.toLocaleString("en-US");

/** UTF-8 bytes of a string. */
export const bytesOf = (text: string) => [...new TextEncoder().encode(text)];

/** A byte as 8 characters of 0 and 1. */
export const bin8 = (byte: number) => byte.toString(2).padStart(8, "0");

/** The HTTP request chapter 1 follows, byte for byte. */
export const PROFILE_REQUEST =
  "GET /profile HTTP/1.1\r\nHost: api.kade.lk\r\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9\r\nCookie: session_id=8f2a91c\r\nAccept: application/json\r\nUser-Agent: Mozilla/5.0\r\n\r\n";
