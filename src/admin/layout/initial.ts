/** First letter of a name for the avatar ("[Эзэмшигчийн нэр]" → "Э"). */
export function initialOf(name: string): string {
  return name.match(/\p{L}/u)?.[0].toUpperCase() ?? 'А'
}
