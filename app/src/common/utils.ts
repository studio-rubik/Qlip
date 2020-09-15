export function mapEnumKeys<T, S>(
  E: T,
  callback: (n: number, i: number) => S,
): S[] {
  return Object.keys(E)
    .filter((key) => typeof (E as any)[key] === 'string')
    .map((key, i) => {
      const k = Number(key);
      return callback(k, i);
    });
}
export function truncate(str: string, len: number) {
  const pat = new RegExp(`(.{${len + 1}})..+`);
  return str.replace(pat, '$1…');
}
