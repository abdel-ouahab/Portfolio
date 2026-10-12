"use client";

import { useEffect, useState } from "react";

/** "It's 14:32 in Chlef, Algeria." Rendered after mount so server and client agree. */
export function LocalTime({ timeZone, place }: { timeZone: string; place: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <span>
      {time ? (
        <>
          It&apos;s <time className="font-medium tabular-nums text-foreground">{time}</time> in {place}.
        </>
      ) : (
        place
      )}
    </span>
  );
}
