import { revalidate } from "@/lib/openformat";
import { useEffect, useState } from "react";

export function useRevalidate(shouldRevalidate: boolean, interval = 2500, maxCount = 4) {
  const [hasComplete, setHasComplete] = useState(false);

  useEffect(() => {
    if (!shouldRevalidate) return;

    let revalidateCount = 0;
    const intervalId = setInterval(() => {
      if (revalidateCount < maxCount) {
        revalidate();
        revalidateCount++;
      } else {
        clearInterval(intervalId);
        setHasComplete(true);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [shouldRevalidate, interval, maxCount]);

  return { hasComplete };
}
