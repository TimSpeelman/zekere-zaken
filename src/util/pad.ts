export function pad(n: any, width: number, z: string | number = "0") {
    n = `${n}`;
    return n.length >= width ? n : new Array(width - n.length + 1).join(`${z}`) + n;
}