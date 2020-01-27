import { Dict } from "../types/Dict";

export interface Cache<T> {
    set: (key: string, value: T) => void,
    get: (key: string) => T | undefined,
    remove: (key: string) => void,
}

export class LocalStorageJSONCache<T> implements Cache<T>{
    set(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    get(key: string) {
        const d = localStorage.getItem(key);
        return d && JSON.parse(d);
    }
    remove(key: string) {
        localStorage.removeItem(key);
    }
}

export class InMemoryCache<T> implements Cache<T>{
    private data: Dict<T> = {};
    set(key: string, value: T) {
        this.data[key] = value;
    }
    get(key: string) {
        return this.data[key];
    }
    remove(key: string) {
        delete this.data[key];
    }
}
