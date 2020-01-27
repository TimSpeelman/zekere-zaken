
export function failIfFalsy<T>(val: T, msg: string): T {
    if (!val) {
        throw new Error(msg);
    } else {
        return val;
    }
}
