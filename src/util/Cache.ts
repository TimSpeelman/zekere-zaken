
export interface IValueStore<T> {
    set: (value: T) => void,
    get: () => T | undefined,
    remove: () => void,
}

export interface IKeyValueStore<T> {
    set: (key: string, value: T) => void,
    get: (key: string) => T | undefined,
    remove: (key: string) => void,
}

export class LocalStorageValueStore<T> implements IValueStore<T>{
    constructor(private key: string) { }
    set = (value: T) => {
        localStorage.setItem(this.key, JSON.stringify(value));
    }
    get = () => {
        try {
            const d = localStorage.getItem(this.key);
            const r = d && JSON.parse(d);
            return r;
        } catch (e) {
            return undefined;
        }
    }
    remove = () => {
        localStorage.removeItem(this.key);
    }
}

export class LocalStorageKeyValueStore<T> implements IKeyValueStore<T>{
    set = (key: string, value: T) => new LocalStorageValueStore(key).set(value);
    get = (key: string) => new LocalStorageValueStore(key).get();
    remove = (key: string) => new LocalStorageValueStore(key).remove();
}

export class InMemoryValueStore<T> implements IValueStore<T>{
    private value?: T = undefined;
    set = (value: T) => {
        this.value = value;
    }
    get = () => {
        return this.value;
    }
    remove() {
        this.value = undefined;
    }
}

export class InMemoryKeyValueStore<T> implements IKeyValueStore<T>{
    set = (key: string, value: T) => new LocalStorageValueStore(key).set(value);
    get = (key: string) => new LocalStorageValueStore(key).get();
    remove = (key: string) => new LocalStorageValueStore(key).remove();
}
