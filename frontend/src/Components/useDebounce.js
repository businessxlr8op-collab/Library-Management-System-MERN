import { useEffect, useRef } from "react";

/**
 * Debounces a callback function.
 * @param {Function} callback - The function to debounce.
 * @param {any[]} deps - Dependency array for the effect.
 * @param {number} delay - Debounce delay in ms.
 * @returns {void}
 */
export function useDebounce(callback, deps, delay = 500) {
  const handler = useRef();

  useEffect(() => {
    if (handler.current) clearTimeout(handler.current);
    handler.current = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
