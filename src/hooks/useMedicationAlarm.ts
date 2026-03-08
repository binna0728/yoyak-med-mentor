import { useState, useEffect, useCallback, useRef } from 'react';

export interface AlarmItem {
  id: string;
  name: string;
  time: string;
  period: string;
}

interface UseMedicationAlarmReturn {
  currentAlarm: AlarmItem | null;
  dismissAlarm: () => void;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

const ALARM_CHECK_INTERVAL = 30_000; // 30s

export function useMedicationAlarm(
  items: AlarmItem[]
): UseMedicationAlarmReturn {
  const [currentAlarm, setCurrentAlarm] = useState<AlarmItem | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    setPermissionGranted(granted);
    return granted;
  }, []);

  const dismissAlarm = useCallback(() => {
    setCurrentAlarm(null);
  }, []);

  // Parse "오전 8:00", "오후 1:00", "저녁 7:00", "취침 전" into minutes since midnight
  const parseTimeToMinutes = useCallback((timeStr: string): number | null => {
    // Handle "취침 전" as 22:00
    if (timeStr.includes('취침')) return 22 * 60;

    const match = timeStr.match(/(오전|오후|저녁|새벽)\s*(\d{1,2}):(\d{2})/);
    if (!match) return null;

    let [, period, h, m] = match;
    let hours = parseInt(h);
    const minutes = parseInt(m);

    if (period === '오후' || period === '저녁') {
      if (hours < 12) hours += 12;
    } else if (period === '오전' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }, []);

  // Check alarms periodically
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      for (const item of items) {
        const itemMinutes = parseTimeToMinutes(item.time);
        if (itemMinutes === null) continue;

        const diff = nowMinutes - itemMinutes;
        // Trigger if within 0~2 minutes past the scheduled time
        if (diff >= 0 && diff <= 2) {
          const alarmKey = `${todayKey}-${item.id}`;
          if (notifiedRef.current.has(alarmKey)) continue;
          notifiedRef.current.add(alarmKey);

          // In-app banner
          setCurrentAlarm(item);

          // Browser push notification
          if (permissionGranted && 'Notification' in window) {
            try {
              new Notification('💊 복약 시간이에요!', {
                body: `${item.name} — ${item.time}`,
                icon: '/favicon.ico',
                tag: alarmKey,
              });
            } catch {
              // Silent fail for environments that don't support Notification constructor
            }
          }
          break;
        }
      }
    };

    check();
    const interval = setInterval(check, ALARM_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [items, permissionGranted, parseTimeToMinutes]);

  // Reset notified set at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    const timeout = setTimeout(() => {
      notifiedRef.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return { currentAlarm, dismissAlarm, permissionGranted, requestPermission };
}
