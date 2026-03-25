"use client";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function Celebration({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (trigger) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#ef4444', '#3b82f6']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#ef4444', '#3b82f6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [trigger]);

  return null;
}