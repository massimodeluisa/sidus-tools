/**
 * Tips are applied as native `title` on labels (see UiField / ResultCard / UiUnitField).
 * No visible “?” buttons: hover the label text for the browser tooltip.
 *
 * Kept as a no-op export so older call sites / tests do not break.
 */
export function FieldTip(_props: { text: string; className?: string }) {
  return null
}
