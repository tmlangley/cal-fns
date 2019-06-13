export const alternateSelection = (day, { start, end, state }) => {
  if (day.disabled) return { start, end, state };

  const startState = {
    state: 'start',
    start: day,
    end: null
  };

  switch (state) {
    case 'none':
      return startState;
    case 'start':
      const cond = day.ts > start.ts;

      return {
        start: cond ? start : day,
        state: cond ? 'both' : 'start',
        end: cond ? day : null
      };
    case 'both':
      return startState;
    default:
      return {
        state: null,
        start: null,
        end: null
      };
  }
};
