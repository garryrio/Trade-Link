/**
 * Penggabung className sederhana.
 * Dibuat manual supaya project tidak perlu dependency tambahan (clsx/classnames).
 *
 * cn("a", false && "b", undefined, "c") -> "a c"
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input && input !== 0) continue;

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(" ");
}
