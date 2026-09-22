// West Africa Time (Africa/Lagos) is a fixed UTC+1 offset with no DST,
// so a plain millisecond shift is sufficient and avoids pulling in a
// timezone library. This must be used anywhere attendance "today" or
// clock-in/out times are computed — Vercel's serverless functions run
// in UTC, so `new Date()` alone silently drifts the daily boundary and
// the punctuality cutoff by a full hour.
const WAT_OFFSET_MS = 60 * 60 * 1000;

function watNow(): Date {
  return new Date(Date.now() + WAT_OFFSET_MS);
}

export function getWATDateStr(): string {
  return watNow().toISOString().split('T')[0];
}

export function getWATTimeStr(): string {
  return watNow().toISOString().split('T')[1].split('.')[0];
}
