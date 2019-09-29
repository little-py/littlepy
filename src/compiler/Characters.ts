export function isFirstIdentifierChar(c: string): boolean {
  return c === '_' || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}

export function isIdentifierChar(c: string): boolean {
  return c === '_' || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
}

export function isStringMarkerChar(c: string): boolean {
  return c === '"' || c === "'";
}

export function isDigit(c: string): boolean {
  return c >= '0' && c <= '9';
}
