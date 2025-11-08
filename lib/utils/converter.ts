/**
 * Some fields in the prototype API responses are delivered as pipe separated strings.
 * This helper splits the string by `|` and trims each segment to produce an array of values.
 */
export const splitPipeSeparatedString = (value: string): string[] => {
  if (!value) {
    return [];
  }
  return value.split('|').map((s) => s.trim());
};
