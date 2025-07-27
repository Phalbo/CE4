// In lib/music-theory-utils.js
export function getChordRootAndType(chordName) {
  if (!chordName) return [null, null];
  const rootMatch = chordName.match(/^[A-G](#|b)?/);
  if (!rootMatch) return [null, null];
  const root = rootMatch[0];
  const type = chordName.substring(root.length);
  return [root, type];
}
