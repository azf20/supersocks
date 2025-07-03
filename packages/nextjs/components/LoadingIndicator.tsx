"use client";

import { useState } from "react";

export const Status = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  IDLE: "IDLE",
  ERROR: "ERROR",
} as const;

export type StatusT = keyof typeof Status;

export type LoadingIndicatorProps = {
  status: StatusT;
  className?: string;
};

export const LoadingIndicator = ({ status = Status.IDLE, className }: LoadingIndicatorProps) => {
  const [position, setPosition] = useState<string>("translateX(-90%)");

  // Simple interval implementation
  useState(() => {
    if (status === Status.PENDING) {
      const interval = setInterval(() => {
        setPosition(prev => (prev === "translateX(90%)" ? "translateX(-90%)" : "translateX(90%)"));
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  return (
    <div
      className={`pointer-events-none relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`}
    >
      <span
        style={{
          transform: status === Status.PENDING ? position : "translateX(0)",
        }}
        className={`absolute h-full w-full rounded-full transition ${
          status === Status.PENDING
            ? "bg-blue-500 duration-1000"
            : status === Status.SUCCESS
              ? "bg-green-500 duration-500"
              : status === Status.ERROR
                ? "bg-red-500 duration-500"
                : "opacity-0"
        }`}
      />
    </div>
  );
};
