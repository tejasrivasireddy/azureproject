import { useMemo, useState } from "react";
import { STATUS_STYLES, STATUSES, PRIORITY_STYLES, formatDate, parseTags } from "../constants";
import WorkItemTypeIcon from "./WorkItemTypeIcon";

export default function WorkItemBoard({ items, onSelect, onNew, onStatusChange }) {
  const [typeFilter, setTypeFilter] = useState("");
  const [dragId, setDragId] = useState(null);

  const filtered = useMemo(() => {
    if (!typeFilter) return items;
    return items.filter((i) => i.type === typeFilter);
  }, [items, typeFilter]);

  const columns = STATUSES.map((status) => ({
    status,
    items: filtered.filter((i) => i.status === status),
  }));

  const types = [...new Set(items.map((i) => i.type))];

  function handleDrop(status) {
    if (dragId) {
      onStatusChange(dragId, status);
      setDragId(null);
    }
  }

  return (
    <div className="panel board-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <div>
            <h1>Board</h1>
            <p className="panel-subtitle">Drag cards to update state</p>
          </div>
          <button type="button" className="btn-primary" onClick={onNew}>New work item</button>
        </div>

        <div className="filter-bar">
          <label className="filter-field">
            <span>Type</span>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div className="kanban-board">
          {columns.map(({ status, items: colItems }) => (
            <div
              key={status}
              className={`kanban-column ${dragId ? "kanban-column-drop" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              <div className="kanban-column-header">
                <span className="status-pill" style={STATUS_STYLES[status]}>{status}</span>
                <span className="kanban-count">{colItems.length}</span>
              </div>
              <div className="kanban-cards">
                {colItems.length === 0 && <p className="kanban-empty muted">No items</p>}
                {colItems.map((item) => (
                  <article
                    key={item.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => setDragId(item.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onSelect(item.id)}
                  >
                    <div className="kanban-card-top">
                      <WorkItemTypeIcon type={item.type} size="sm" />
                      <span className="kanban-id">{item.id}</span>
                    </div>
                    <h3 className="kanban-card-title">{item.title}</h3>
                    {parseTags(item.tags).length > 0 && (
                      <div className="row-tags">
                        {parseTags(item.tags).slice(0, 2).map((t) => (
                          <span key={t} className="ado-tag">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="kanban-card-meta">
                      <span className="priority-pill" style={PRIORITY_STYLES[item.priority]}>
                        {item.priority_label}
                      </span>
                      {item.assignee && item.assignee !== "Unassigned" && (
                        <span className="assignee-chip">{item.assignee}</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
