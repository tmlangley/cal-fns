import { curry } from 'ramda';
import { getTime, isValid } from 'date-fns';

const merge = (obj, key, val) => ({...obj, [key]: val });

export const setDisabled = curry((cond, d) => merge(d, 'disabled', cond));

export const disablePastDay = d => setDisabled(d.isPast, d);

export const inRange = curry((s, e, ts) => ts > s && ts < e);

export const inRangeInclusive = curry((s, e, ts) => ts >= s && ts <= e);

export const applyToRange = curry((fn, s, e, d) => inRange(s, e, d.ts) ? fn(d) : d);

export const inclusiveApplyToRange = curry((fn, s, e, d) => inRangeInclusive(s, e, d.ts) ? fn(d) : d);

const normalizeRangeProps = (s, e, d, fn) => {
  if (typeof s === 'number' && typeof e === 'number') {
    return fn(s, e, d);
  }

  if (typeof s === 'string' && typeof e === 'string') {
    return fn(getTime(new Date(s)), getTime(new Date(e)), d);
  }

  if (isValid(s) && isValid(e)) {
    return fn(getTime(s), getTime(e), d);
  }

  console.warn('Invalid properties passed to "disabledRange". Start and end must be of the same valid date type');
  return d;
};

export const disableRange = curry((s, e, d) => {
  return normalizeRangeProps(s, e, d, applyToRange(setDisabled(true)));
});

export const disableRangeInclusive = curry((s, e, d) => {
  return normalizeRangeProps(s, e, d, inclusiveApplyToRange(setDisabled(true)));
});

