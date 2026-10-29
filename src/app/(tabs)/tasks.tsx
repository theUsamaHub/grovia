import { CategoryPicker } from '@/features/categories/panel';
import { useCallback, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/ui/screen';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { useFocus } from '@/features/focus/provider';
import {
  initialPlanner,
  localDay,
  validateTask,
  visibleTasks,
  type Task,
  type Planner,
} from '@/features/tasks/model';
import {
  loadPlanner,
  savePlanner,
  focusTotals,
} from '@/features/tasks/repository';
export default function TasksScreen() {
  const { palette } = useAppTheme();
  const focus = useFocus();
  const [planner, setPlanner] = useState<Planner>(initialPlanner);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'Today' | 'Upcoming' | 'Completed'>('Today');
  const [draft, setDraft] = useState<Task | null>(null);
  const [estimate, setEstimate] = useState('');
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [goal, setGoal] = useState('60');
  const [totals, setTotals] = useState<{
    tasks: Record<string, number>;
    daily: number;
  }>({ tasks: {}, daily: 0 });
  const [revision, setRevision] = useState(0);
  const [opacity] = useState(() => new Animated.Value(1));
  useFocusEffect(
    useCallback(() => {
      // Reload when a session is saved or the user retries.
      void revision;
      void focus.history;
      let alive = true;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      Promise.all([loadPlanner(), focusTotals(start.getTime(), end.getTime())])
        .then(([data, stats]) => {
          if (alive) {
            setPlanner(data);
            setGoal(String(data.goalMinutes));
            setTotals(stats);
            setReady(true);
            setError('');
          }
        })
        .catch(() => {
          if (alive)
            setError('Your planner could not be opened. Please retry.');
        });
      return () => {
        alive = false;
      };
    }, [revision, focus.history]),
  );
  const save = useCallback(async (next: Planner) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await savePlanner(next);
      setPlanner(next);
      return true;
    } catch {
      setError('This change could not be saved. Please try again.');
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, []);
  const animate = async () => {
    if (await AccessibilityInfo.isReduceMotionEnabled()) return;
    opacity.setValue(0.65);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };
  const edit = (task?: Task) => {
    setError('');
    setDraft(
      task ?? {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
        title: '',
        description: '',
        category: '',
        priority: 'normal',
        estimate: null,
        due: '',
        completed: false,
        createdAt: Date.now(),
      },
    );
    setEstimate(task?.estimate ? String(task.estimate) : '');
  };
  const submit = async () => {
    if (!draft) return;
    try {
      const task = validateTask({
        ...draft,
        estimate: estimate.trim() ? Number(estimate) : null,
      });
      const next = {
        ...planner,
        tasks: planner.tasks.some((t) => t.id === task.id)
          ? planner.tasks.map((t) => (t.id === task.id ? task : t))
          : [...planner.tasks, task],
      };
      if (await save(next)) {
        setDraft(null);
        void animate();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check the task details.');
    }
  };
  const fieldStyle = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
    color: palette.text,
    backgroundColor: palette.background,
    minHeight: 48,
  };
  const button = (label: string, action: () => void, selected = false) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: busy }}
      disabled={busy}
      onPress={action}
      style={{
        padding: 12,
        minHeight: 44,
        borderRadius: 16,
        backgroundColor: selected ? palette.primary : palette.surfaceMuted,
      }}
    >
      <AppText
        variant="label"
        style={{ color: selected ? palette.onPrimary : palette.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
  const tasks = visibleTasks(planner.tasks, view);
  const minutes = Math.floor(totals.daily / 60000);
  const progress = Math.min(1, minutes / planner.goalMinutes);
  return (
    <Screen
      title="Your intentions"
      subtitle="Small steps make room for meaningful days."
    >
      {!ready ? (
        <Card>
          <AppText>{error || 'Opening your planner…'}</AppText>
          {!!error && (
            <AppButton
              label="Retry"
              onPress={() => setRevision((r) => r + 1)}
            />
          )}
        </Card>
      ) : (
        <>
          <Card>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <AppText variant="heading">Today’s gentle goal</AppText>
              <Feather name="sun" size={24} color={palette.primary} />
            </View>
            <AppText>
              {minutes} / {planner.goalMinutes} focus minutes
            </AppText>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: planner.goalMinutes,
                now: Math.min(minutes, planner.goalMinutes),
              }}
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: palette.surfaceMuted,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 8,
                  width: progress * 100 + '%',
                  backgroundColor: palette.primary,
                }}
              />
            </View>
            <View
              style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
            >
              <TextInput
                accessibilityLabel="Daily focus goal in minutes"
                value={goal}
                onChangeText={setGoal}
                keyboardType="number-pad"
                maxLength={4}
                style={[fieldStyle, { flex: 1 }]}
              />
              <AppButton
                label="Save goal"
                disabled={busy}
                onPress={() => {
                  const n = Number(goal);
                  if (!Number.isInteger(n) || n < 1 || n > 1440) {
                    setError('Choose a goal of 1–1440 whole minutes.');
                    return;
                  }
                  void save({ ...planner, goalMinutes: n });
                }}
              />
            </View>
          </Card>
          <AppButton
            label="Add an intention"
            disabled={busy}
            onPress={() => edit()}
          />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['Today', 'Upcoming', 'Completed'] as const).map((item) =>
              button(
                item,
                () => {
                  setView(item);
                  void animate();
                },
                view === item,
              ),
            )}
          </View>
          {view === 'Today' && (
            <AppText muted>
              Unscheduled and overdue intentions are included here.
            </AppText>
          )}
          {!!error && !draft && (
            <AppText
              accessibilityRole="alert"
              style={{ color: palette.danger }}
            >
              {error}
            </AppText>
          )}
          <Animated.View style={{ opacity, gap: 16 }}>
            {tasks.length === 0 ? (
              <Card>
                <Feather
                  name={view === 'Completed' ? 'check-circle' : 'wind'}
                  size={28}
                  color={palette.primary}
                />
                <AppText variant="heading">
                  {view === 'Completed'
                    ? 'Every small finish belongs here'
                    : 'A little room to breathe'}
                </AppText>
                <AppText muted>
                  {view === 'Upcoming'
                    ? 'Future intentions will appear here when you set a due date.'
                    : view === 'Completed'
                      ? 'Complete an intention to celebrate your progress.'
                      : 'Add one thing you’d like to give your attention to.'}
                </AppText>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={'Complete ' + task.title}
                      accessibilityState={{
                        checked: task.completed,
                        disabled: busy,
                      }}
                      disabled={busy}
                      onPress={() =>
                        void save({
                          ...planner,
                          tasks: planner.tasks.map((t) =>
                            t.id === task.id
                              ? { ...t, completed: !t.completed }
                              : t,
                          ),
                        }).then((ok) => {
                          if (ok) void animate();
                        })
                      }
                      style={{ padding: 10 }}
                    >
                      <Feather
                        name={task.completed ? 'check-circle' : 'circle'}
                        size={25}
                        color={palette.primary}
                      />
                    </Pressable>
                    <View style={{ flex: 1, gap: 4 }}>
                      <AppText
                        variant="heading"
                        style={{
                          textDecorationLine: task.completed
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {task.title}
                      </AppText>
                      <AppText muted>
                        {task.category || 'Personal'} · {task.priority} priority
                      </AppText>
                    </View>
                  </View>
                  {!!task.description && <AppText>{task.description}</AppText>}
                  <AppText muted>
                    {task.due
                      ? (task.due < localDay() && !task.completed
                          ? 'Overdue · '
                          : 'Due · ') + task.due
                      : 'No due date'}
                    {task.estimate
                      ? ' · ' + task.estimate + ' min estimated'
                      : ''}
                  </AppText>
                  <AppText variant="label">
                    {Math.floor((totals.tasks[task.id] ?? 0) / 60000)} minutes
                    focused
                  </AppText>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                  >
                    {!task.completed &&
                      button(
                        focus.state.active?.taskId === task.id
                          ? 'Open timer'
                          : 'Focus · 25 min',
                        () => {
                          if (focus.state.active) {
                            if (focus.state.active.taskId !== task.id) {
                              setError(
                                'Finish your current session before focusing on another task.',
                              );
                              return;
                            }
                            router.navigate('/');
                            return;
                          }
                          if (!focus.ready || focus.busy) return;
                          void focus
                            .start('pomodoro', 25, 5, {
                              id: task.id,
                              title: task.title,
                              category: task.category,
                            })
                            .then(() => router.navigate('/'));
                        },
                      )}
                    {button('Edit', () => edit(task))}
                    {button('Delete', () => setDeleting(task))}
                  </View>
                </Card>
              ))
            )}
          </Animated.View>
        </>
      )}
      <Modal
        visible={!!draft}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (!busy) setDraft(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#00000080',
            padding: 20,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              maxHeight: '90%',
              width: '100%',
              maxWidth: 560,
              alignSelf: 'center',
              backgroundColor: palette.surface,
              borderRadius: 24,
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 24, gap: 16 }}
            >
              <AppText variant="heading">
                {planner.tasks.some((t) => t.id === draft?.id)
                  ? 'Edit intention'
                  : 'Plant an intention'}
              </AppText>
              {draft && (
                <>
                  {(
                    [
                      { key: 'title', label: 'Title', max: 120 },
                      {
                        key: 'description',
                        label: 'Notes (optional)',
                        max: 2000,
                      },
                      {
                        key: 'category',
                        label: 'Category (optional)',
                        max: 60,
                      },
                      {
                        key: 'due',
                        label: 'Due date (YYYY-MM-DD, optional)',
                        max: 10,
                      },
                    ] as const
                  ).map((field) => (
                    <View key={field.key} style={{ gap: 6 }}>
                      <AppText variant="label">{field.label}</AppText>
                      <TextInput
                        accessibilityLabel={field.label}
                        value={draft[field.key]}
                        onChangeText={(value) =>
                          setDraft({ ...draft, [field.key]: value })
                        }
                        maxLength={field.max}
                        multiline={field.key === 'description'}
                        style={fieldStyle}
                      />
                    </View>
                  ))}
                  <CategoryPicker
                    value={draft.category}
                    onChange={(category) => setDraft({ ...draft, category })}
                    disabled={busy}
                  />
                  <AppText variant="label">Priority</AppText>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['low', 'normal', 'high'] as const).map((priority) =>
                      button(
                        priority,
                        () => setDraft({ ...draft, priority }),
                        draft.priority === priority,
                      ),
                    )}
                  </View>
                  <AppText variant="label">
                    Estimated minutes (optional)
                  </AppText>
                  <TextInput
                    accessibilityLabel="Estimated minutes"
                    value={estimate}
                    onChangeText={setEstimate}
                    maxLength={4}
                    keyboardType="number-pad"
                    style={fieldStyle}
                  />
                </>
              )}
              {!!error && (
                <AppText
                  accessibilityRole="alert"
                  style={{ color: palette.danger }}
                >
                  {error}
                </AppText>
              )}
              <AppButton
                label="Save intention"
                disabled={busy}
                onPress={() => void submit()}
              />
              <AppButton
                label="Cancel"
                disabled={busy}
                onPress={() => {
                  setDraft(null);
                  setError('');
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={!!deleting}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (!busy) setDeleting(null);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#00000080',
          }}
        >
          <Card>
            <AppText variant="heading">Delete this intention?</AppText>
            <AppText>
              {deleting?.title} will be removed. Your recorded focus sessions
              will stay in history.
            </AppText>
            {!!error && <AppText accessibilityRole="alert">{error}</AppText>}
            <AppButton
              label="Delete intention"
              disabled={busy}
              onPress={() =>
                void save({
                  ...planner,
                  tasks: planner.tasks.filter((t) => t.id !== deleting?.id),
                }).then((ok) => {
                  if (ok) setDeleting(null);
                })
              }
            />
            <AppButton
              label="Keep it"
              disabled={busy}
              onPress={() => setDeleting(null)}
            />
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
