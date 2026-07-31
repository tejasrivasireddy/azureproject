from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, ForeignKey, text, inspect
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from fastapi import Depends

DATABASE_URL = "sqlite:///./work_items.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


WORK_ITEM_TYPES = ["Epic", "Feature", "User Story", "Task", "Bug"]
STATUSES = ["New", "Active", "Resolved", "Closed"]
PRIORITY_LABELS = {1: "Critical", 2: "High", 3: "Medium", 4: "Low"}
ITERATIONS = ["Backlog", "Sprint 1", "Sprint 2", "Sprint 3"]
TEAM_MEMBERS = ["Unassigned", "You", "Alice", "Bob", "Carol"]

ALLOWED_CHILDREN = {
    None: ["Epic", "Feature", "User Story", "Task", "Bug"],
    "Epic": ["Feature", "User Story", "Task", "Bug"],
    "Feature": ["User Story", "Task", "Bug"],
    "User Story": ["Task", "Bug"],
    "Task": [],
    "Bug": [],
}


class WorkItem(Base):
    __tablename__ = "work_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="New")
    description = Column(String, nullable=True, default="")
    priority = Column(Integer, nullable=False, default=2)
    assignee = Column(String, nullable=True, default="Unassigned")
    tags = Column(String, nullable=True, default="")
    story_points = Column(Integer, nullable=True)
    iteration = Column(String, nullable=True, default="Backlog")
    parent_id = Column(Integer, ForeignKey("work_items.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkItemComment(Base):
    __tablename__ = "work_item_comments"

    id = Column(Integer, primary_key=True, index=True)
    work_item_id = Column(Integer, ForeignKey("work_items.id"), nullable=False, index=True)
    author = Column(String, nullable=False, default="You")
    text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def _migrate_schema():
    inspector = inspect(engine)
    if "work_items" not in inspector.get_table_names():
        return
    columns = {c["name"] for c in inspector.get_columns("work_items")}
    with engine.begin() as conn:
        if "description" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN description VARCHAR DEFAULT ''"))
        if "priority" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN priority INTEGER DEFAULT 2"))
        if "assignee" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN assignee VARCHAR DEFAULT 'Unassigned'"))
        if "tags" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN tags VARCHAR DEFAULT ''"))
        if "story_points" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN story_points INTEGER"))
        if "iteration" not in columns:
            conn.execute(text("ALTER TABLE work_items ADD COLUMN iteration VARCHAR DEFAULT 'Backlog'"))
        conn.execute(
            text("UPDATE work_items SET status = 'Resolved' WHERE status = 'Development Complete'")
        )


_migrate_schema()


class WorkItemCreate(BaseModel):
    title: str
    type: str
    parent_id: Optional[int] = None
    description: Optional[str] = ""
    priority: int = 2
    assignee: Optional[str] = "Unassigned"
    tags: Optional[str] = ""
    story_points: Optional[int] = None
    iteration: Optional[str] = "Backlog"

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v):
        if v not in WORK_ITEM_TYPES:
            raise ValueError(f"type must be one of {WORK_ITEM_TYPES}")
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("title cannot be empty")
        return v.strip()

    @field_validator("priority")
    @classmethod
    def priority_must_be_valid(cls, v):
        if v not in PRIORITY_LABELS:
            raise ValueError(f"priority must be one of {list(PRIORITY_LABELS.keys())}")
        return v

    @field_validator("iteration")
    @classmethod
    def iteration_must_be_valid(cls, v):
        if v and v not in ITERATIONS:
            raise ValueError(f"iteration must be one of {ITERATIONS}")
        return v


class WorkItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    assignee: Optional[str] = None
    tags: Optional[str] = None
    story_points: Optional[int] = None
    iteration: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("title cannot be empty")
        return v.strip() if v is not None else v

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v):
        if v is not None and v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def priority_must_be_valid(cls, v):
        if v is not None and v not in PRIORITY_LABELS:
            raise ValueError(f"priority must be one of {list(PRIORITY_LABELS.keys())}")
        return v

    @field_validator("iteration")
    @classmethod
    def iteration_must_be_valid(cls, v):
        if v is not None and v not in ITERATIONS:
            raise ValueError(f"iteration must be one of {ITERATIONS}")
        return v


class CommentCreate(BaseModel):
    text: str
    author: Optional[str] = "You"

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v):
        if not v.strip():
            raise ValueError("comment cannot be empty")
        return v.strip()


class CommentOut(BaseModel):
    id: int
    work_item_id: int
    author: str
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


class WorkItemOut(BaseModel):
    id: int
    title: str
    type: str
    status: str
    description: Optional[str] = ""
    priority: int
    priority_label: str
    assignee: Optional[str] = "Unassigned"
    tags: Optional[str] = ""
    story_points: Optional[int] = None
    iteration: Optional[str] = "Backlog"
    parent_id: Optional[int]
    parent_title: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkItemDetail(WorkItemOut):
    children: List[WorkItemOut] = []
    comments: List[CommentOut] = []


app = FastAPI(title="Work Item Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_out(item: WorkItem, db: Session) -> WorkItemOut:
    parent_title = None
    if item.parent_id:
        parent = db.get(WorkItem, item.parent_id)
        parent_title = parent.title if parent else None
    return WorkItemOut(
        id=item.id,
        title=item.title,
        type=item.type,
        status=item.status,
        description=item.description or "",
        priority=item.priority,
        priority_label=PRIORITY_LABELS.get(item.priority, "Medium"),
        assignee=item.assignee or "Unassigned",
        tags=item.tags or "",
        story_points=item.story_points,
        iteration=item.iteration or "Backlog",
        parent_id=item.parent_id,
        parent_title=parent_title,
        created_at=item.created_at,
    )


def _delete_recursive(db: Session, item_id: int):
    comments = db.query(WorkItemComment).filter(WorkItemComment.work_item_id == item_id).all()
    for c in comments:
        db.delete(c)
    children = db.query(WorkItem).filter(WorkItem.parent_id == item_id).all()
    for child in children:
        _delete_recursive(db, child.id)
    item = db.get(WorkItem, item_id)
    if item:
        db.delete(item)


@app.get("/api/work-items", response_model=List[WorkItemOut])
def list_work_items(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    assignee: Optional[str] = Query(None),
    iteration: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(WorkItem)
    if type:
        if type not in WORK_ITEM_TYPES:
            raise HTTPException(status_code=400, detail=f"type must be one of {WORK_ITEM_TYPES}")
        query = query.filter(WorkItem.type == type)
    if status:
        if status not in STATUSES:
            raise HTTPException(status_code=400, detail=f"status must be one of {STATUSES}")
        query = query.filter(WorkItem.status == status)
    if assignee:
        query = query.filter(WorkItem.assignee == assignee)
    if iteration:
        query = query.filter(WorkItem.iteration == iteration)
    if tag:
        query = query.filter(WorkItem.tags.ilike(f"%{tag.strip()}%"))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (WorkItem.title.ilike(term))
            | (WorkItem.description.ilike(term))
            | (WorkItem.tags.ilike(term))
        )
    items = query.order_by(WorkItem.id).all()
    return [_to_out(i, db) for i in items]


@app.get("/api/work-items/{item_id}", response_model=WorkItemDetail)
def get_work_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(WorkItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")

    children = (
        db.query(WorkItem)
        .filter(WorkItem.parent_id == item_id)
        .order_by(WorkItem.id)
        .all()
    )
    comments = (
        db.query(WorkItemComment)
        .filter(WorkItemComment.work_item_id == item_id)
        .order_by(WorkItemComment.created_at)
        .all()
    )
    out = _to_out(item, db).model_dump()
    out["children"] = [_to_out(c, db) for c in children]
    out["comments"] = [CommentOut.model_validate(c) for c in comments]
    return out


@app.post("/api/work-items", response_model=WorkItemOut, status_code=201)
def create_work_item(payload: WorkItemCreate, db: Session = Depends(get_db)):
    if payload.parent_id is not None:
        parent = db.get(WorkItem, payload.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent work item not found")
        allowed = ALLOWED_CHILDREN.get(parent.type, [])
        if payload.type not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"A {parent.type} cannot have a {payload.type} child. Allowed: {allowed}",
            )
    else:
        if payload.type not in ALLOWED_CHILDREN[None]:
            raise HTTPException(
                status_code=400,
                detail=f"Top-level items must be one of {ALLOWED_CHILDREN[None]}",
            )

    item = WorkItem(
        title=payload.title,
        type=payload.type,
        parent_id=payload.parent_id,
        description=payload.description or "",
        priority=payload.priority,
        assignee=payload.assignee or "Unassigned",
        tags=payload.tags or "",
        story_points=payload.story_points,
        iteration=payload.iteration or "Backlog",
        status="New",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_out(item, db)


@app.patch("/api/work-items/{item_id}", response_model=WorkItemOut)
def update_work_item(item_id: int, payload: WorkItemUpdate, db: Session = Depends(get_db)):
    item = db.get(WorkItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")

    for field in ("title", "description", "status", "priority", "assignee", "tags", "story_points", "iteration"):
        value = getattr(payload, field)
        if value is not None:
            setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _to_out(item, db)


@app.delete("/api/work-items/{item_id}", status_code=204)
def delete_work_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(WorkItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    _delete_recursive(db, item_id)
    db.commit()
    return None


@app.get("/api/work-items/{item_id}/comments", response_model=List[CommentOut])
def list_comments(item_id: int, db: Session = Depends(get_db)):
    if not db.get(WorkItem, item_id):
        raise HTTPException(status_code=404, detail="Work item not found")
    comments = (
        db.query(WorkItemComment)
        .filter(WorkItemComment.work_item_id == item_id)
        .order_by(WorkItemComment.created_at)
        .all()
    )
    return [CommentOut.model_validate(c) for c in comments]


@app.post("/api/work-items/{item_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(item_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    if not db.get(WorkItem, item_id):
        raise HTTPException(status_code=404, detail="Work item not found")
    comment = WorkItemComment(
        work_item_id=item_id,
        author=payload.author or "You",
        text=payload.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut.model_validate(comment)


@app.get("/api/meta")
def get_meta():
    return {
        "types": WORK_ITEM_TYPES,
        "statuses": STATUSES,
        "priorities": PRIORITY_LABELS,
        "iterations": ITERATIONS,
        "team_members": TEAM_MEMBERS,
        "allowed_children": ALLOWED_CHILDREN,
    }
