import { useEffect, useState } from "react";

export default function CountdownTimer({ expireAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(expireAt) - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);

        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const format = (n) => n.toString().padStart(2, "0");

      setTimeLeft(
        `${format(hours)}:${format(minutes)}:${format(seconds)}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [expireAt]);

  return (
    <span className="text-red-500 font-semibold">
      {timeLeft}
    </span>
  );
}