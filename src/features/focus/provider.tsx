import { readValue } from '../journal/repository';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { loadFocus, persistFocus } from './repository';
import { requestReminderPermission, syncReminder } from './notifications';
import {
  completeSession,
  createSession,
  elapsed,
  emptyState,
  finish,
  pause,
  resume,
  checkpoint,
  type FocusMode,
  type FocusState,
  type RecordEntry,
} from './engine';
type ContextValue = {
  state: FocusState;
  history: RecordEntry[];
  now: number;
  ready: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  start: (
    mode: FocusMode,
    minutes: number,
    breakMinutes: number,
    task?: { id: string; title: string; category?: string },
    category?: string,
  ) => Promise<void>;
  command: (
    command: 'pause' | 'resume' | 'stop' | 'restart' | 'break' | 'dismiss',
  ) => Promise<void>;
  toggleReminders: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<ContextValue | null>(null);
const sessionId = () =>
  Date.now().toString(36) +
  '-' +
  Math.random().toString(36).slice(2) +
  '-' +
  Math.random().toString(36).slice(2);
export function FocusProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FocusState>(emptyState);
  const current = useRef(state);
  const [history, setHistory] = useState<RecordEntry[]>([]);
  const [now, setNow] = useState(Date.now);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const commit = useCallback(async (next: FocusState, record?: RecordEntry) => {
    await persistFocus(next, record);
    current.current = next;
    setState(next);
    setNow(Date.now());
    if (record)
      setHistory((items) =>
        [record, ...items.filter((r) => r.id !== record.id)].slice(0, 30),
      );
    try {
      await syncReminder(next);
    } catch {
      setNotice(
        'The timer is saved, but its notification could not be updated. Please check it when you return.',
      );
    }
  }, []);
  const operate = useCallback(async (task: () => Promise<void>) => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch {
      setError(
        'We could not save this change. Your last saved session is safe. Please try again.',
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    loadFocus()
      .then(async (data) => {
        if (!active) return;
        let next = data.state;
        let record: RecordEntry | undefined;
        if (
          next.active &&
          elapsed(next.active, Date.now()) >= next.active.durationMs
        ) {
          const result = completeSession(
            next,
            next.active,
            Date.now(),
            sessionId(),
          );
          record = result.record;
          next = result.state;
          await persistFocus(next, record);
        }
        if (!active) return;
        current.current = next;
        setState(next);
        setHistory(
          record
            ? [
                record,
                ...data.history.filter((r) => r.id !== record!.id),
              ].slice(0, 30)
            : data.history,
        );
        setReady(true);
        try {
          await syncReminder(next);
        } catch {
          if (active)
            setNotice(
              'Completion alerts are unavailable. Your timer still works.',
            );
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Your focus data could not be opened. Try again to safely restore your session.',
          );
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    if (!ready || !state.active) return;
    const update = () => {
      const time = Date.now();
      setNow(time);
      const s = current.current.active;
      if (!s || s.anchorMs === null) return;
      if (elapsed(s, time) >= s.durationMs)
        void operate(async () => {
          const live = current.current.active;
          if (!live) return;
          const result = completeSession(
            current.current,
            live,
            Date.now(),
            sessionId(),
            true,
          );
          await commit(result.state, result.record);
        });
      else if (time < s.anchorMs)
        void operate(async () => {
          await commit({ ...current.current, active: checkpoint(s, time) });
          setNotice(
            'The device clock moved backward. The timer continued from its last saved elapsed time.',
          );
        });
    };
    let interval: ReturnType<typeof setInterval> | undefined;
    const activate = () => {
      if (interval) clearInterval(interval);
      update();
      interval = setInterval(update, 1000);
    };
    if (AppState.currentState === 'active' || AppState.currentState === null)
      activate();
    const listener = AppState.addEventListener('change', (value) => {
      if (value === 'active') activate();
      else if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    });
    return () => {
      if (interval) clearInterval(interval);
      listener.remove();
    };
  }, [ready, state.active, operate, commit]);
  const start = async (
    mode: FocusMode,
    minutes: number,
    breakMinutes: number,
    task?: { id: string; title: string; category?: string },
    category?: string,
  ) => {
    if (!ready) return;
    await operate(async () => {
      if (current.current.active) return;
      const active = createSession(
        mode,
        minutes,
        breakMinutes,
        Date.now(),
        sessionId(),
      );
      active.category = category || task?.category || 'Personal';
      if (task) {
        active.taskId = task.id;
        active.taskTitle = task.title;
      }
      const config = await readValue('routine', {
        autoAdvance: false,
        cycles: 4,
        longBreakMinutes: 15,
      });
      await commit({
        ...current.current,
        routine: {
          autoAdvance: config.autoAdvance && mode !== 'stopwatch',
          cycles: config.cycles,
          longBreakMinutes: config.longBreakMinutes,
          completed: 0,
          focus: active,
        },
        active,
        last: null,
        nextBreakMinutes: breakMinutes,
      });
    });
  };
  const command = async (
    command: 'pause' | 'resume' | 'stop' | 'restart' | 'break' | 'dismiss',
  ) => {
    if (!ready) return;
    await operate(async () => {
      const previous = current.current;
      const s = previous.active;
      const time = Date.now();
      if (command === 'dismiss') {
        await commit({ ...previous, last: null });
        return;
      }
      if (command === 'break' && !s) {
        await commit({
          ...previous,
          last: null,
          active: createSession(
            'custom',
            previous.nextBreakMinutes,
            previous.nextBreakMinutes,
            time,
            sessionId(),
            'break',
          ),
        });
        return;
      }
      if (!s) return;
      if (elapsed(s, time) >= s.durationMs) {
        const result = completeSession(previous, s, time, sessionId());
        await commit(result.state, result.record);
        return;
      }
      if (command === 'pause') {
        await commit({ ...previous, active: pause(s, time) });
        return;
      }
      if (command === 'resume') {
        await commit({ ...previous, active: resume(s, time) });
        return;
      }
      if (command === 'stop' || command === 'restart') {
        const record = finish(s, time, 'stopped');
        const active =
          command === 'restart'
            ? createSession(
                s.mode,
                s.mode === 'stopwatch' ? 25 : s.durationMs / 60000,
                s.breakMinutes,
                time,
                sessionId(),
                s.kind,
              )
            : null;
        if (active) {
          active.category = s.category;
          active.taskId = s.taskId;
          active.taskTitle = s.taskTitle;
        }
        await commit(
          { ...previous, active, last: command === 'stop' ? record : null },
          record,
        );
      }
    });
  };
  const toggleReminders = async () => {
    if (!ready) return;
    await operate(async () => {
      if (!current.current.reminders && !(await requestReminderPermission())) {
        setNotice(
          'Notifications are unavailable or not allowed. You can enable them in device settings.',
        );
        return;
      }
      setNotice(null);
      await commit({
        ...current.current,
        reminders: !current.current.reminders,
      });
    });
  };
  return (
    <Context.Provider
      value={{
        state,
        history,
        now,
        ready,
        busy,
        error,
        notice,
        start,
        command,
        toggleReminders,
        retry: () => {
          setError(null);
          setAttempt((a) => a + 1);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useFocus() {
  const context = useContext(Context);
  if (!context) throw new Error('FocusProvider is required');
  return context;
}
