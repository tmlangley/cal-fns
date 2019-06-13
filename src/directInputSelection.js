export const directInputSelection = cal => field => dayIndex => (day, selection) => {
  const { start, end, state } = selection;

  if (day.disabled) return { start, end, state };

  let nextStart = null;
  let nextEnd = null;

  if (end && day.ts >= end.ts) {
    nextStart = day;
    nextEnd = cal[1].length <= dayIndex + 1 ? cal[2][0] : cal[1][dayIndex + 1];
  } else if (field === 'start') {
    nextStart = day;
    nextEnd = end;
  } else if (field === 'end') {
    nextStart = start;
    nextEnd = day;
  }

  return { state, start: nextStart, end: nextEnd };
};
