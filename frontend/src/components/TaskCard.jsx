import { Reorder, useDragControls } from "framer-motion";
import { Check, Clock, GripVertical, Pencil, Trash2, Play, Repeat, Tag } from "lucide-react";
import { PRIORITY_STYLES } from "../lib/utils-app";

export const TaskCard = ({ task, onToggle, onEdit, onDelete, onStartTimer, isActive }) => {
  const controls = useDragControls();
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      data-testid={`task-card-${task.id}`}
      className="bg-[var(--surface)] nb-border nb-shadow rounded-md p-5 mb-4 relative"
      style={{ outline: isActive ? "3px solid var(--green)" : "none", outlineOffset: 3 }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          data-testid={`drag-handle-${task.id}`}
          onPointerDown={(e) => controls.start(e)}
          className="touch-none cursor-grab active:cursor-grabbing pt-1 opacity-50 hover:opacity-100"
          aria-label="Drag"
        >
          <GripVertical size={20} strokeWidth={2.5} />
        </button>

        {/* Checkbox */}
        <button
          data-testid={`toggle-task-${task.id}`}
          onClick={() => onToggle(task)}
          className="w-7 h-7 flex-shrink-0 nb-border rounded-md flex items-center justify-center mt-0.5"
          style={{
            background: task.completed ? "var(--green)" : "transparent",
          }}
          aria-label="Complete"
        >
          {task.completed && <Check size={16} strokeWidth={4} className="tick-pop text-black" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className="font-display text-[11px] px-2 py-0.5 nb-border rounded-sm"
              style={{ background: p.bg, color: p.text }}
              data-testid={`priority-badge-${task.id}`}
            >
              {p.label}
            </span>
            {task.due_time && (
              <span className="text-xs font-bold flex items-center gap-1 opacity-70">
                <Clock size={12} strokeWidth={3} /> {task.due_time}
              </span>
            )}
            <span className="text-xs font-bold opacity-70">
              {task.estimated_minutes}m
            </span>
            {task.recurring && (
              <span className="text-xs font-bold flex items-center gap-1" style={{ color: "var(--blue)" }}>
                <Repeat size={12} strokeWidth={3} /> daily
              </span>
            )}
          </div>

          <h3
            className={`font-display text-xl leading-tight ${task.completed ? "line-through opacity-50" : ""}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 opacity-75 ${task.completed ? "line-through opacity-40" : ""}`}>
              {task.description}
            </p>
          )}

          {task.tags?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border-c)" }}
                >
                  <Tag size={10} strokeWidth={3} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {task.elapsed_seconds > 0 && (
            <div className="mt-3 text-xs font-mono-display opacity-70">
              tracked: {Math.floor(task.elapsed_seconds / 60)}m {task.elapsed_seconds % 60}s
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            data-testid={`start-timer-${task.id}`}
            onClick={() => onStartTimer(task)}
            disabled={task.completed}
            className="w-9 h-9 nb-border rounded-md flex items-center justify-center nb-press-lg disabled:opacity-30"
            style={{ background: "var(--green)" }}
            aria-label="Start timer"
          >
            <Play size={14} strokeWidth={3} className="text-black" />
          </button>
          <button
            data-testid={`edit-task-${task.id}`}
            onClick={() => onEdit(task)}
            className="w-9 h-9 nb-border rounded-md flex items-center justify-center nb-press-lg"
            style={{ background: "var(--surface)" }}
            aria-label="Edit"
          >
            <Pencil size={14} strokeWidth={3} />
          </button>
          <button
            data-testid={`delete-task-${task.id}`}
            onClick={() => onDelete(task)}
            className="w-9 h-9 nb-border rounded-md flex items-center justify-center nb-press-lg"
            style={{ background: "var(--pink)", color: "white" }}
            aria-label="Delete"
          >
            <Trash2 size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
};
