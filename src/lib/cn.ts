/**
 * Une classNames condicionalmente, ignorando valores falsy.
 * Usar en todos los componentes para mantener la convención.
 */
export function cn(
  ...values: Array<string | number | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
