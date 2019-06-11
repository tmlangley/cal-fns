export const alternateSelection = (cal, day, { start, end, state }) => {
  switch (state) {
    case 'none':
      return {
        state: day.isFuture ? 'start' : 'none',
        start: day.isFuture ? day : null,
        end: null
      };
    case 'start':
      const cond = day.ts > start.ts;

      return {
        start: cond ? start : day,
        state: cond ? 'both' : 'start',
        end: cond ? day : null
      };
    case 'both':
      return {
        state: day.isFuture ? 'start' : 'both',
        start: day.isFuture ? day : start,
        end: day.isFuture ? null : end
      };
    default:
      return {
        state: null,
        start: null,
        end: null
      };
  }
};
