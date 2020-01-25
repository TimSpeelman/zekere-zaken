

/**
 * Given a list of functions, invoke one by one and return the first
 * result that is not undefined.
 * 
 * Example:
 *     const fb = fallback1([
 *         (x: number) => x > 10 ? x * 100 : undefined,
 *         (x: number) => x > 5 ? x * 3 : undefined,
 *         (x: number) => x > 1 ? x : undefined,
 *     ])
 *     
 *     fb(12); // 1200
 *     fb(7); // 21
 *     fb(2); // 2
 *     fb(0); // undefined
 */
export function fallback1<A, R>(fns: Array<OptFn1<A, R>>, fallbackValue: R): OptFn1<A, R> {
    return (argA: A): R => {
        for (let fn of fns) {
            const result = fn(argA);
            if (result !== fallbackValue) {
                return result;
            }
        }
        return fallbackValue;
    }
}

type OptFn1<A, R> = (a: A) => R

// export function fallback2<A, B, R>(fns: Array<OptFn2<A, B, R>>, fallbackValue: any = undefined): OptFn2<A, B, R> {
//     return (argA: A, argB: B) => {
//         for (let fn of fns) {
//             const result = fn(argA, argB);
//             if (result !== fallbackValue) {
//                 return result;
//             }
//         }
//         return fallbackValue;
//     }
// }

// type OptFn2<A, B, R, F> = (a: A, b: B, ) => R | F

// export function fallback3<A, B, C, R>(fns: Array<OptFn3<A, B, C, R>>, fallbackValue: any = undefined): OptFn3<A, B, C, R> {
//     return (argA: A, argB: B, argC: C) => {
//         for (let fn of fns) {
//             const result = fn(argA, argB, argC);
//             if (result !== fallbackValue) {
//                 return result;
//             }
//         }
//         return fallbackValue;
//     }
// }

// type OptFn3<A, B, C, R, F> = (a: A, b: B, c: C) => R | F


