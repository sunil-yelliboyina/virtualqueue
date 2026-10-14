"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { NOTIFICATION_THRESHOLD } from "@/lib/constants";

type NotificationType = "approaching" | "next" | "serving" | null;

/**
 * Hook that manages notification state based on queue position.
 * Triggers visual/audio alerts when the customer's turn is approaching.
 */
export function useNotification(position: number, status: string) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] =
    useState<NotificationType>(null);
  const previousPositionRef = useRef<number>(position);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dismiss = useCallback(() => {
    setShowNotification(false);
    setNotificationType(null);
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple notification beep using Web Audio API
      if (typeof window !== "undefined") {
        const audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.value = 0.3;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch {
      // Audio playback not available — fail silently
    }
  }, []);

  useEffect(() => {
    const prevPosition = previousPositionRef.current;
    previousPositionRef.current = position;

    if (status === "SERVING") {
      setShowNotification(true);
      setNotificationType("serving");
      playNotificationSound();
      return;
    }

    if (status !== "WAITING") {
      dismiss();
      return;
    }

    // Trigger notification when position drops to threshold
    if (position === 1 && prevPosition > 1) {
      setShowNotification(true);
      setNotificationType("next");
      playNotificationSound();
    } else if (
      position <= NOTIFICATION_THRESHOLD &&
      prevPosition > NOTIFICATION_THRESHOLD
    ) {
      setShowNotification(true);
      setNotificationType("approaching");
      playNotificationSound();
    }
  }, [position, status, dismiss, playNotificationSound]);

  return { showNotification, notificationType, dismiss };
}
