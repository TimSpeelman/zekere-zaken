import { useEffect, useState } from "react";

export function usePromised<T>(promisable: () => Promise<T>) {
    const [result, setResult] = useState<T | undefined>(undefined);

    useEffect(() => { promisable().then(setResult); }, []);

    return result;
}