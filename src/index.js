import {
  compose,
  curry,
  identity,
  flip,
  prop
} from 'ramda';
import {
  startOfDay,
  startOfMonth,
  getTime,
  addDays,
  getDay,
  subMonths,
  addMonths,
  format,
  isSameMonth
} from 'date-fns';

const defaultFormat = {
  month: 'MMMM',
  weekday: 'ddd',
  day: 'D'
};

const getDayTs = compose(getTime, startOfDay);

const today = getDayTs(new Date());

const inRange = curry((y, z, x) => x >= y && x < z);

const equals = curry((x, y) => x === y);

const greaterThan = curry((x, y) => x > y);
const lessThan = curry((x, y) => x < y);

const isToday = equals(today);

const setPropFromProp = curry((propToUse, propToSet, fn, obj) => ({ ...obj, [propToSet]: fn(obj[propToUse])}));

const createDateObj = date => ({ date });

const mapDeep = f => matrix => matrix.map(arr => arr.map(d => f(d)));

const curriedFormat = fmt => date => format(date, fmt);

export const setStart = curry((ts, cal) => mapDeep(
  equals(ts, prop('ts')),
  cal));

export const formatDay = curry((fmt, day) => setPropFromProp('date', 'format', curriedFormat(fmt), day));

export const formatDayR = flip(formatDay);

export const formatDays = curry((fmt, cal) => mapDeep(formatDay(fmt))(cal));

// export const selectDay = (cal, { ts }) => {
//   const current = null;
//
//   return mapDeep(({ day, isSelected }) => {
//     // if (current !== null && )
//   });
// };

export const createMonth = (date = new Date(), fns = [identity]) => {
  return (function create(val = []) {
    return (val.length > 41) ? val : create([
      ...val,
      compose(
        ...fns,
        setPropFromProp('ts', 'isPast', greaterThan(today)),
        setPropFromProp('ts', 'isFuture', lessThan(today)),
        setPropFromProp('date', 'inMonth', curry(isSameMonth)(date)),
        setPropFromProp('ts', 'isToday', isToday),
        setPropFromProp('date', 'ts', getDayTs),
        createDateObj
      )(addDays(startOfMonth(date), val.length - getDay(startOfMonth(date))))
    ]);
  })();
};

export const createCal = (date = new Date(), fns = [identity]) => [
  createMonth(subMonths(date, 1), fns),
  createMonth(date, fns),
  createMonth(addMonths(date, 1), fns)
];
