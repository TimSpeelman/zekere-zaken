import { useEffect, useState } from "react";

export function useClock(millisPerTick: number) {
    const [time, setTime] = useState(Date.now());

    let interval: any = null;
    useEffect(() => {
        setInterval(() => setTime(Date.now()), millisPerTick);
        return () => clearInterval(interval);
    }, [])

    return time;
}
