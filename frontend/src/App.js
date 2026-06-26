import { useMemo, useState } from "react";
import "@/App.css";
import { Reorder } from "framer-motion";
import { Plus, Search, Wifi, WifiOff, Filter, ListChecks } from "lucide-react";
import { Toaster, toast } from "sonner";

import { useTasks } from "./hooks/useTasks";
import { ThemeToggle } from "./components/ThemeToggle";
import { TaskCard } from "./components/TaskCard";
import { TimerWidget } from "./components/TimerWidget";
import { TaskFormModal } from "./components/TaskFormModal";
import { StatsPanel } from "./components/StatsPanel";
import { EmptyState } from "./components/EmptyState";
import { todayDateLabel } from "./lib/utils-app";

function App() {
  const {
    tasks,
    online,
    syncing,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    logSession,
  } = useTasks();

  const [activeTask, setActiveTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  const filtered = useMemo(() => {
    let list = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "done") list = list.filter((t) => t.completed);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tasks, query, filter]);

  const handleSave = async (data) => {
    if (editing) {
      await updateTask(editing.id, data);
      toast.success("Task updated");
    } else {
      await addTask(data);
      toast.success("Task added");
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleToggle = async (task) => {
    const completed = !task.completed;
    await updateTask(task.id, {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
    if (completed) toast.success("Done! 🎯");
  };

  const handleDelete = async (task) => {
    await deleteTask(task.id);
    if (activeTask?.id === task.id) setActiveTask(null);
    toast.success("Task removed");
  };

  const handleEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleStartTimer = (task) => {
    setActiveTask(task);
    document.getElementById("timer-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="App grain min-h-screen relative" data-testid="app-root">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--text)",
            border: "2.5px solid var(--border-c)",
            boxShadow: "4px 4px 0 0 var(--shadow-c)",
            borderRadius: "8px",
            fontWeight: 700,
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 relative z-10">
        {/* Header */}
        <header className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div className="slide-in">
            <div className="text-xs font-bold uppercase tracking-[0.25em] opacity-60 mb-1">
              {todayDateLabel()}
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-[0.95]">
              TODAY's <span style={{ color: "var(--pink)" }}>GRIND</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              data-testid="online-status"
              className="nb-border nb-shadow-sm rounded-md px-3 h-12 flex items-center gap-2 text-xs font-bold uppercase"
              style={{
                background: online ? "var(--green)" : "var(--pink)",
                color: online ? "black" : "white",
              }}
            >
              {online ? <Wifi size={14} strokeWidth={3} /> : <WifiOff size={14} strokeWidth={3} />}
              {syncing ? "Syncing…" : online ? "Online" : "Offline"}
            </div>
            <ThemeToggle />
            <button
              data-testid="add-task-btn"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="nb-border nb-shadow rounded-md h-12 px-5 font-display inline-flex items-center gap-2 nb-press-lg"
              style={{ background: "var(--yellow)", color: "black" }}
            >
              <Plus size={18} strokeWidth={3} />
              New Task
            </button>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* LEFT: tasks */}
          <section>
            <div id="timer-anchor" />
            {activeTask && (
              <div className="mb-6">
                <TimerWidget
                  task={activeTask}
                  onClose={() => setActiveTask(null)}
                  onLogSession={logSession}
                  onUpdateTask={updateTask}
                />
              </div>
            )}

            {/* Search + filter */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={16}
                  strokeWidth={3}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                />
                <input
                  data-testid="search-input"
                  placeholder="Search tasks, tags…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full nb-border rounded-md pl-10 pr-3 h-11 bg-[var(--surface)] font-semibold outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                />
              </div>
              <div className="flex nb-border rounded-md overflow-hidden">
                {["all", "active", "done"].map((f) => (
                  <button
                    key={f}
                    data-testid={`filter-${f}-btn`}
                    onClick={() => setFilter(f)}
                    className="px-4 h-11 font-display text-xs uppercase"
                    style={{
                      background: filter === f ? "var(--text)" : "var(--surface)",
                      color: filter === f ? "var(--bg)" : "var(--text)",
                      borderRight: f !== "done" ? "2.5px solid var(--border-c)" : "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              tasks.length === 0 ? (
                <EmptyState
                  onAdd={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                />
              ) : (
                <div className="nb-border rounded-md p-8 text-center opacity-70 bg-[var(--surface)]">
                  <Filter className="mx-auto mb-2" size={28} strokeWidth={3} />
                  No tasks match your filter.
                </div>
              )
            ) : (
              <Reorder.Group
                axis="y"
                values={filtered}
                onReorder={(newOrder) => {
                  // Merge filtered reorder back into full task list
                  if (filter === "all" && !query.trim()) {
                    reorderTasks(newOrder);
                  } else {
                    // Reorder only filtered; preserve others' relative order
                    const otherIds = new Set(newOrder.map((t) => t.id));
                    const merged = [
                      ...newOrder,
                      ...tasks.filter((t) => !otherIds.has(t.id)),
                    ];
                    reorderTasks(merged);
                  }
                }}
                data-testid="task-list"
              >
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartTimer={handleStartTimer}
                    isActive={activeTask?.id === task.id}
                  />
                ))}
              </Reorder.Group>
            )}
          </section>

          {/* RIGHT: stats */}
          <aside className="space-y-5">
            <div className="nb-border nb-shadow rounded-md p-5 bg-[var(--surface)]">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={18} strokeWidth={3} />
                <h2 className="font-display text-xl">DAILY STATS</h2>
              </div>
              <StatsPanel tasks={tasks} />
            </div>

            <div
              className="nb-border nb-shadow rounded-md p-5"
              style={{ background: "var(--lilac)", color: "black" }}
            >
              <h3 className="font-display text-lg mb-2">QUICK TIP</h3>
              <p className="text-sm font-semibold leading-snug">
                Tap{" "}
                <span
                  className="px-1.5 py-0.5 nb-border rounded-sm"
                  style={{ background: "var(--green)", fontWeight: 800 }}
                >
                  ▶
                </span>{" "}
                on any task to start a focused timer. Pomodoro mode auto-cycles work + breaks.
              </p>
            </div>

            <div
              className="nb-border nb-shadow rounded-md p-5"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              <h3 className="font-display text-lg mb-2">OFFLINE MODE</h3>
              <p className="text-sm font-semibold leading-snug opacity-90">
                Everything saves to your device first, then syncs when you're back online.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <TaskFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}

export default App;
