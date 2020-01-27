export function last<T>(items?: T[]): T | undefined {
    return !items || items.length === 0 ? undefined : items[items.length - 1];
}