# Daily Offline Task Scheduler with Timer — PRD

## Problem Statement
Daily offline task scheduler with timer

## User Choices
- Timer: countdown, pomodoro (25/5), stopwatch (per task)
- Task fields: title, description, priority, tags, due_time, estimated duration, recurring
- Storage: Hybrid — localStorage cache + MongoDB sync when online
- Extras: progress stats, sound alert, drag-and-drop reordering, dark mode
- Design vibe: Bold & colorful (Neo-Brutalism)

## Architecture
- Backend: FastAPI + MongoDB (motor). Endpoints under `/api`:
  - GET/POST /tasks, PUT/DELETE /tasks/{id}, POST /tasks/reorder
  - POST /sessions, GET /stats
- Frontend: React 19 + Tailwind + framer-motion (Reorder for DnD) + sonner (toasts)
- Offline-first: All mutations write to localStorage first, queued pending ops sync when online (auto-detect, 30s poll + event-based)

## Implemented (2026-06)
- Full task CRUD with localStorage cache and queued offline ops
- Three timer modes (countdown, pomodoro auto-cycle, stopwatch)
- Drag-and-drop reordering via framer-motion Reorder
- Dark/light theme toggle
- Daily stats: completion %, time tracked, remaining
- Search + filter (all/active/done)
- Sound beep + toast on timer end
- Neo-Brutalist design (Archivo Black + Manrope + JetBrains Mono)

## Backlog (P1/P2)
- P1: Calendar view, weekly stats with charts (recharts)
- P1: Notification API for background timer alerts
- P2: Export tasks to CSV/JSON
- P2: Keyboard shortcuts
- P2: Recurring task auto-resets at midnight
