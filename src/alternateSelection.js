export const alternateSelection = (day, { start, end, state }) => {
  switch (state) {
    case 'none':
      return {
        state: day.disabled ? 'none' : 'start',
        start: day.disabled ? null : day,
        end: null
      };
    case 'start':
      if (day.disabled) return { start, end, day };
      const cond = day.ts > start.ts;

      return {
        start: cond ? start : day,
        state: cond ? 'both' : 'start',
        end: cond ? day : null
      };
    case 'both':
      return {
        state: day.disabled ? 'both' : 'start',
        start: day.disabled ? start : day,
        end: day.disabled ? end : null
      };
    default:
      return {
        state: null,
        start: null,
        end: null
      };
  }
};
