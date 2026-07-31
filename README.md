# Azure Boards  — Work Item Tracker

Azure DevOps Boards–style work item tracker (Epic → Feature → User Story → Task/Bug).

## Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, Vite

## Run locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173
