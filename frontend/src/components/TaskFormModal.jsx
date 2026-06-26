import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TIMER_MODES } from "../lib/utils-app";

const EMPTY = {
  title: "",
  description: "",
  priority: "medium",
  tags: "",
  due_time: "",
  estimated_minutes: 25,
  recurring: false,
  timer_mode: "countdown",
};

export const TaskFormModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          ...initial,
          tags: (initial.tags || []).join(", "),
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      estimated_minutes: parseInt(form.estimated_minutes, 10) || 25,
      due_time: form.due_time || null,
    };
    onSave(payload);
  };

  const inputCls =
    "w-full nb-border rounded-md px-3 py-2.5 bg-[var(--bg)] text-[var(--text)] font-semibold outline-none focus:ring-2 focus:ring-[var(--yellow)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        data-testid="task-form-modal"
        className="w-full max-w-lg bg-[var(--surface)] nb-border nb-shadow-lg rounded-md p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-3xl">
            {initial ? "Edit Task" : "New Task"}
          </h2>
          <button
            data-testid="modal-close-btn"
            onClick={onClose}
            className="w-9 h-9 nb-border rounded-md flex items-center justify-center nb-press-lg"
            style={{ background: "var(--pink)", color: "white" }}
            aria-label="Close"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1">Title</label>
            <input
              data-testid="task-title-input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              placeholder="Write proposal..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1">Description</label>
            <textarea
              data-testid="task-description-input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputCls}
              placeholder="Optional details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Priority</label>
              <div className="flex gap-2">
                {["high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    data-testid={`priority-${p}-btn`}
                    onClick={() => setForm({ ...form, priority: p })}
                    className="flex-1 nb-border rounded-md py-2 font-display text-xs uppercase nb-press"
                    style={{
                      background:
                        form.priority === p
                          ? p === "high"
                            ? "#FF3366"
                            : p === "medium"
                            ? "#FFCC00"
                            : "#C8B6FF"
                          : "var(--bg)",
                      color: form.priority === p && p === "high" ? "white" : "black",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Timer Mode</label>
              <select
                data-testid="timer-mode-select"
                value={form.timer_mode}
                onChange={(e) => setForm({ ...form, timer_mode: e.target.value })}
                className={inputCls}
              >
                {TIMER_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Due Time</label>
              <input
                data-testid="due-time-input"
                type="time"
                value={form.due_time || ""}
                onChange={(e) => setForm({ ...form, due_time: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Duration (min)</label>
              <input
                data-testid="duration-input"
                type="number"
                min={1}
                value={form.estimated_minutes}
                onChange={(e) => setForm({ ...form, estimated_minutes: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1">Tags (comma separated)</label>
            <input
              data-testid="tags-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className={inputCls}
              placeholder="work, deep-focus"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              data-testid="recurring-checkbox"
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              className="w-5 h-5 nb-border accent-[var(--yellow)]"
            />
            <span className="text-sm font-bold">Repeat daily</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-testid="modal-cancel-btn"
              onClick={onClose}
              className="flex-1 nb-border rounded-md py-3 font-display nb-press-lg"
              style={{ background: "var(--surface)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="modal-save-btn"
              className="flex-[2] nb-border rounded-md py-3 font-display nb-press-lg"
              style={{ background: "var(--yellow)", color: "black" }}
            >
              {initial ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
