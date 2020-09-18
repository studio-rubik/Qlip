import moment from 'moment';

function toDate(utciso: string) {
  return moment
    .utc(utciso)
    .local()
    .format('YYYY-MM-DD');
}

function toDateTime(utciso: string) {
  return moment
    .utc(utciso)
    .local()
    .format('YYYY-MM-DD H:mm:ss Z');
}

function toRelative(utciso: string) {
  return moment
    .utc(utciso)
    .local()
    .fromNow();
}

export const fromUTC = {
  toDate,
  toDateTime,
  toRelative,
};

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
