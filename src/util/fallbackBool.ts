
export const fallbackBool = (...bools: (boolean | undefined)[]) => bools.find(b => b === true || b === false) || false;
