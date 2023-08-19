import { useEffect, useRef } from "react";

function useInterval(callback) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    });
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
  
      let id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, []);
}

export default useInterval