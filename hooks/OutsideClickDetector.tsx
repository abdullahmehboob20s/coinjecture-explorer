import { useEffect, useRef, useCallback } from "react";

const OutsideClickDetector = <T extends HTMLElement>(handler: () => void, enabled: boolean) => {
  const ref = useRef<T>(null);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (enabled && ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    },
    [handler, enabled]
  );

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener("mousedown", handleClick);
    };

    if (enabled) {
      document.addEventListener("mousedown", handleClick);
      return cleanup;
    }

    cleanup();
  }, [handleClick, enabled]);

  return ref;
};

export default OutsideClickDetector;
