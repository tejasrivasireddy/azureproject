import { useEffect, useState } from "react";
import { api } from "./api";
import { ALLOWED_CHILDREN } from "./constants";
import WorkItemList from "./components/WorkItemList";
import WorkItemBoard from "./components/WorkItemBoard";
import BacklogsView from "./components/BacklogsView";
import SprintsView from "./components/SprintsView";
import QueriesView from "./components/QueriesView";
import WorkItemPanel from "./components/WorkItemPanel";
import NewWorkItemModal from "./components/NewWorkItemModal";

const NAV = [
  { id: "work-items", label: "Work items" },
  { id: "boards", label: "Boards" },
  { id: "backlogs", label: "Backlogs" },
  { id: "sprints", label: "Sprints" },
  { id: "queries", label: "Queries" },
];

export default function App() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState("work-items");
  const [selected, setSelected] = useState(null);
  const [modalParent, setModalParent] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshList(filters = {}) {
    setLoading(true);
    try {
      const data = await api.listWorkItems(filters);
      setItems(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function openItem(id) {
    try {
      const detail = await api.getWorkItem(id);
      setSelected(detail);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(payload) {
    const parentId = modalParent?.id ?? null;
    await api.createWorkItem({ ...payload, parent_id: parentId });
    await refreshList();
    if (parentId) await openItem(parentId);
  }

  async function handleUpdate(id, data) {
    await api.updateWorkItem(id, data);
    await refreshList();
    await openItem(id);
  }

  async function handleStatusChange(id, status) {
    await api.updateWorkItem(id, { status });
    await refreshList();
    if (selected?.id === id) await openItem(id);
  }

  async function handleAssignIteration(id, iteration) {
    await api.updateWorkItem(id, { iteration });
    await refreshList();
  }

  async function handleDelete(id) {
    await api.deleteWorkItem(id);
    setSelected(null);
    await refreshList();
  }

  async function handleAddComment(id, text) {
    await api.addComment(id, text);
    await openItem(id);
  }

  function runQuery(filters) {
    setView("work-items");
    refreshList(filters);
  }

  const modalAllowedTypes = modalParent
    ? ALLOWED_CHILDREN[modalParent.type] || []
    : ALLOWED_CHILDREN.none;

  return (
    <div className="ado-app">
      <header className="ado-topbar">
        <div className="ado-topbar-left">
          <span className="ado-logo" aria-hidden="true" />
          <span className="ado-org">Azure DevOps</span>
          <span className="ado-breadcrumb">/</span>
          <span className="ado-project">Contoso</span>
          <span className="ado-breadcrumb">/</span>
          <span className="ado-hub">Boards</span>
        </div>
        <span className="ado-user-chip" title="You">Y</span>
      </header>

      <nav className="ado-subnav">
        {NAV.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`ado-subnav-link ${view === tab.id ? "active" : ""}`}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="ado-main">
        {error && (
          <div className="error-banner">
            {error}
            <button type="button" className="error-dismiss" onClick={() => setError("")}>×</button>
          </div>
        )}

        {loading && view !== "queries" ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="muted">Loading work items…</p>
          </div>
        ) : view === "work-items" ? (
          <WorkItemList items={items} onSelect={openItem} onNew={() => setModalParent(null)} />
        ) : view === "boards" ? (
          <WorkItemBoard
            items={items}
            onSelect={openItem}
            onNew={() => setModalParent(null)}
            onStatusChange={handleStatusChange}
          />
        ) : view === "backlogs" ? (
          <BacklogsView items={items} onSelect={openItem} onNew={() => setModalParent(null)} />
        ) : view === "sprints" ? (
          <SprintsView
            items={items}
            onSelect={openItem}
            onAssignIteration={handleAssignIteration}
          />
        ) : (
          <QueriesView onRunQuery={runQuery} onNew={() => setModalParent(null)} />
        )}
      </main>

      {selected && (
        <WorkItemPanel
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddComment={handleAddComment}
          onSelectChild={openItem}
          onNewLinked={() => setModalParent(selected)}
        />
      )}

      {modalParent !== undefined && (
        <NewWorkItemModal
          allowedTypes={modalAllowedTypes}
          onClose={() => setModalParent(undefined)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
