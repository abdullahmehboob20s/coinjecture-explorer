"use client"

import { useEffect, useState } from "react";

function useDelayUnmount(isMounted: boolean, delayTime: number) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isMounted && !shouldRender) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    } else if (!isMounted && shouldRender) {
      timeoutId = setTimeout(() => setShouldRender(false), delayTime);
    }
    return () => clearTimeout(timeoutId!);
  }, [isMounted, delayTime, shouldRender]);

  return shouldRender;
}

export default useDelayUnmount;
