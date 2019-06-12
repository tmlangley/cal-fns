import {
  compose,
  curry,
  curryN,
  flip,
  mergeLeft
} from 'ramda';
import {
  startOfDay,
  startOfMonth,
  getTime,
  addDays,
  getDay,
  addMonths,
  subMonths,
  startOfYear,
  format,
  isSameMonth
} from 'date-fns';

const debug = false; // [1, 14];
let debugMonth = 0;

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

const mapDeep = curry((f, matrix) => matrix.map(arr => arr.map(d => f(d))));

const curriedFormat = fmt => date => format(date, fmt);

const inspect = data => {
  console.log(data);
  return data;
};

const inspectFn = fn => data => {
  const val = fn(data);

  console.log(val);
  return val;
};

const inspectAll = pipeline => pipeline.map(inspectFn);

export const mapDays = mapDeep;

export const applyTransforms = curry((fns, cal) => mapDeep(compose(...fns), cal));

export const formatDay = curry((fmt, day) => setPropFromProp('date', 'format', curriedFormat(fmt), day));

export const formatDays = curry((fmt, cal) => mapDeep(formatDay(fmt))(cal));

export const updateSelection = curry(({ start, end }, d) => {
  const hoverReset = { hoverTarget: false, hoverRange: false };

  if (
    start &&
    d.ts === start.ts ||
    end && d.ts === end.ts
  ) {
    return { ...d, ...hoverReset, selected: true, inRange: false };
  }
  if (end && d.ts >= start.ts && d.ts <= end.ts) {
    return { ...d, ...hoverReset, selected: false, inRange: true };
  }
  return { ...d, ...hoverReset, selected: false, inRange: false };
});

export const updateCalSelection = curry((cal, start, end) => mapDeep(d => {
  return updateSelection({ start, end }, d);
})(cal));

export const selectDay = curry((strategy, cal, day, selections = defaultSelections) => {
  const selectionState = strategy(day, selections);

  return {
    selectionState,
    cal: updateCalSelection(cal, selectionState.start, selectionState.end)
  };
});

export const updateHover = (cal, day, { start, state } = defaultSelections) => {
  return mapDeep(d => {
    if (day.disabled) return d;
    if (day.ts === d.ts) return {...d, hoverTarget: true, hoverRange: false };
    if (state === 'start' && d.ts < day.ts && d.ts > start.ts) return {...d, hoverTarget: false, hoverRange: true };
    return {...d, hoverTarget: false, hoverRange: false };
  })(cal);
};

export const createMonth = (date = new Date(), fns = []) => {
  const pipeline = [
    ...fns.reverse(),
    formatDay('D'),
    mergeLeft({ disabled: false }),
    setPropFromProp('ts', 'isPast', greaterThan(today)),
    setPropFromProp('ts', 'isFuture', lessThan(today)),
    setPropFromProp('date', 'inMonth', curry(isSameMonth)(date)),
    setPropFromProp('ts', 'isToday', isToday),
    setPropFromProp('date', 'ts', getDayTs),
    createDateObj
  ];

  return (function create(val = []) {
    return (val.length > 41) ? val : create([
      ...val,
      compose(
        ...(debug && debug[0] === debugMonth && debug[1] === val.length ? inspectAll(pipeline) : pipeline)
      )(addDays(startOfMonth(date), val.length - getDay(startOfMonth(date))))
    ]);
  })();
};

export const nextMonth = curry((cal, fns) => {
  return [...cal.slice(1), createMonth(addMonths(cal[cal.length - 1][14].date, 1), fns || [])];
});

export const prevMonth = curry((cal, fns) => {
  return [createMonth(subMonths(cal[0][14].date, 1), fns || []), ...cal.slice(0, -1)];
});

export const getMonthDate = month => startOfMonth(month[14].date);

export const formatDate = flip(curryN(2, format));

export const getMonths = (date, fn = null) => {
  const start = startOfYear(date);

  return (function create(months = []) {
    return (months.length === 12) ?
      months :
      create([
        ...months,
        fn ? fn(addMonths(start, months.length)) : addMonths(start, months.length)
      ]);
  })();
};

export const createCal = (date = new Date(), monthsToShow = 1, fns = []) => {
  return (function create(cal = []) {
    if (debug) debugMonth = cal.length;
    return (cal.length === monthsToShow + 2) ?
      cal :
      create([
        ...cal,
        createMonth(addMonths(date, cal.length - 1), fns)
      ]);
  })();
};
