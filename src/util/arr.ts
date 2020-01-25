/** If it aint array, array it */
export const arr = <T>(a: T | T[]): T[] => a instanceof Array ? a : [a];
