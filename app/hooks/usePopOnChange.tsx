import { useState, useEffect } from "react";

/**
 * Trigger a temporary pop animation when a value changes.
 * @param value The value to watch (string | number | boolean | enum)
 * @param duration Duration of the animation in milliseconds (default 300)
 */
export const usePopOnChange = <T extends string | number | boolean>(value: T, duration = 300) => {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setPop(true);
    const timer = setTimeout(() => setPop(false), duration);
    return () => clearTimeout(timer);
  }, [value, duration]);

  return pop;
};
