
export const between = (value: number, min: number, max: number): boolean => {
  return value > min && value < max;
};

export const rangeIn = (posl: number, posh: number, min: number, max: number): boolean => {
  return posl <= min && posh >= max;
};
