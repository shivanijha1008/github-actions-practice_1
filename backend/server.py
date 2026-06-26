from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class TaskBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    description: str = ""
    priority: str = "medium"  # high | medium | low
    tags: List[str] = []
    due_time: Optional[str] = None  # HH:MM
    estimated_minutes: int = 25
    recurring: bool = False
    timer_mode: str = "countdown"  # countdown | pomodoro | stopwatch
    order: int = 0


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    completed: bool = False
    elapsed_seconds: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    due_time: Optional[str] = None
    estimated_minutes: Optional[int] = None
    recurring: Optional[bool] = None
    timer_mode: Optional[str] = None
    order: Optional[int] = None
    completed: Optional[bool] = None
    elapsed_seconds: Optional[int] = None
    completed_at: Optional[str] = None


class SessionLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    seconds: int
    mode: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SessionCreate(BaseModel):
    task_id: str
    seconds: int
    mode: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Task Scheduler API"}


@api_router.get("/tasks", response_model=List[Task])
async def list_tasks():
    docs = await db.tasks.find({}, {"_id": 0}).sort("order", 1).to_list(2000)
    return [Task(**d) for d in docs]


@api_router.post("/tasks", response_model=Task)
async def create_task(payload: TaskCreate):
    task = Task(**payload.model_dump())
    await db.tasks.insert_one(task.model_dump())
    return task


@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, payload: TaskUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        existing = await db.tasks.find_one({"id": task_id}, {"_id": 0})
        if not existing:
            raise HTTPException(404, "Task not found")
        return Task(**existing)
    result = await db.tasks.find_one_and_update(
        {"id": task_id},
        {"$set": updates},
        return_document=True,
        projection={"_id": 0},
    )
    if not result:
        raise HTTPException(404, "Task not found")
    return Task(**result)


@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Task not found")
    return {"ok": True}


@api_router.post("/tasks/reorder")
async def reorder_tasks(payload: List[dict]):
    """payload: [{id, order}, ...]"""
    for item in payload:
        await db.tasks.update_one({"id": item["id"]}, {"$set": {"order": item["order"]}})
    return {"ok": True}


@api_router.post("/sessions", response_model=SessionLog)
async def log_session(payload: SessionCreate):
    s = SessionLog(**payload.model_dump())
    await db.sessions.insert_one(s.model_dump())
    return s


@api_router.get("/stats")
async def get_stats():
    today_str = date.today().isoformat()
    all_tasks = await db.tasks.find({}, {"_id": 0}).to_list(2000)
    total = len(all_tasks)
    done = sum(1 for t in all_tasks if t.get("completed"))
    completion_pct = round((done / total) * 100) if total else 0

    sessions = await db.sessions.find({}, {"_id": 0}).to_list(5000)
    today_seconds = sum(
        s.get("seconds", 0) for s in sessions if s.get("created_at", "").startswith(today_str)
    )
    return {
        "total_tasks": total,
        "completed_tasks": done,
        "completion_pct": completion_pct,
        "seconds_today": today_seconds,
        "total_sessions": len(sessions),
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
