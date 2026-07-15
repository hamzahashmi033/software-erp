"use client";

import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

interface ViewerTrackerProps {
  invoiceId: string;
}

export function ViewerTracker({ invoiceId }: ViewerTrackerProps) {
  const sessionId = useRef<string>(
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(`viewer_${invoiceId}`) ??
          (() => {
            const id = uuidv4();
            sessionStorage.setItem(`viewer_${invoiceId}`, id);
            return id;
          })()
      : uuidv4()
  );

  useEffect(() => {
    fetch(`/api/pay/${invoiceId}/view`, { method: "POST" }).catch(() => {});

    const sendHeartbeat = () => {
      fetch(`/api/pay/${invoiceId}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20_000);
    return () => clearInterval(interval);
  }, [invoiceId]);

  return null;
}
