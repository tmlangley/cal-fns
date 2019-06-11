import {
  compose,
  curry
} from 'ramda';
import {
  startOfDay,
  startOfMonth,
  getTime,
  addDays,
  getDay,
  addMonths,
  format,
  isSameMonth
} from 'date-fns';

const defaultSelections = {
  state: 'none',
  start: null,
  end: null
};

const getDayTs = compose(getTime, startOfDay);

const today = getDayTs(new Date());

const equals = curry((x, y) => x === y);

const greaterThan = curry((x, y) => x > y);

const lessThan = curry((x, y) => x < y);

const isToday = equals(today);

const setPropFromProp = curry((propToUse, propToSet, fn, obj) => ({ ...obj, [propToSet]: fn(obj[propToUse])}));

const createDateObj = date => ({ date });

const mapDeep = f => matrix => matrix.map(arr => arr.map(d => f(d)));

const curriedFormat = fmt => date => format(date, fmt);

export const mapDays = mapDeep;

export const formatDay = curry((fmt, day) => setPropFromProp('date', 'format', curriedFormat(fmt), day));

export const formatDays = curry((fmt, cal) => mapDeep(formatDay(fmt))(cal));

export const updateCalSelection = (cal, start, end) => mapDeep(d => {
  const hoverReset = { hoverTarget: false, hoverRange: false };

  if (
    d.ts === start.ts ||
    end && d.ts === end.ts
  ) {
    return { ...d, ...hoverReset, selected: true, inRange: false };
  }
  if (end && d.ts >= start.ts && d.ts <= end.ts) {
    return { ...d, ...hoverReset, selected: false, inRange: true };
  }
  return { ...d, ...hoverReset, selected: false, inRange: false };
})(cal);

export const selectDay = curry((strategy, cal, day, selections = defaultSelections) => {
  const selectionState = strategy(cal, day, selections);

  return {
    selectionState,
    cal: updateCalSelection(cal, selectionState.start, selectionState.end)
  };
});

export const updateHover = (cal, day, { start, state } = defaultSelections) => {
  return mapDeep(d => {
    if (day.ts <= today) return d;
    if (day.ts === d.ts) return {...d, hoverTarget: true, hoverRange: false };
    if (state === 'start' & d.ts < day.ts && d.ts > start.ts) return {...d, hoverTarget: false, hoverRange: true };
    return {...d, hoverTarget: false, hoverRange: false };
  })(cal);
};

const defaultFns = [formatDay('D')];

export const createMonth = (date = new Date(), fns = defaultFns) => {
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

export const createCal = (date = new Date(), fns = defaultFns, monthsToShow = 1) => {
  return (function create(cal = []) {
    return (cal.length === monthsToShow + 2) ?
      cal :
      create([
        ...cal,
        createMonth(addMonths(date, cal.length - 1), fns)
      ]);
  })();
};
