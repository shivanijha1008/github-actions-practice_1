import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 8000 });

export const api = {
  listTasks: () => client.get("/tasks").then((r) => r.data),
  createTask: (task) => client.post("/tasks", task).then((r) => r.data),
  updateTask: (id, patch) => client.put(`/tasks/${id}`, patch).then((r) => r.data),
  deleteTask: (id) => client.delete(`/tasks/${id}`).then((r) => r.data),
  reorder: (items) => client.post("/tasks/reorder", items).then((r) => r.data),
  logSession: (s) => client.post("/sessions", s).then((r) => r.data),
  getStats: () => client.get("/stats").then((r) => r.data),
};

export async function isBackendOnline() {
  try {
    await client.get("/", { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
