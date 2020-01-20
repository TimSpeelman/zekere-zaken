import { useEffect } from "react";

export function useTimer(fn: () => void, millis: number) {
    useEffect(() => {
        const handle = setTimeout(fn, millis);
        return () => clearTimeout(handle);
    }, [fn, millis])
}
