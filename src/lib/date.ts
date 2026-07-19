/** Format a Date as a local `YYYY-MM-DD` day key (used for streaks/quests). */
export function formatDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Today's local day key. */
export function today(): string {
  return formatDay(new Date());
}

/** The local day key for the day before the given `YYYY-MM-DD` key. */
export function yesterdayOf(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return formatDay(dt);
}
