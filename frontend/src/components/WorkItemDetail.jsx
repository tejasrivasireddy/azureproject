import { useState } from "react";
import {
  TYPE_COLORS,
  STATUS_STYLES,
  STATUSES,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  formatDate,
} from "../constants";

export default function WorkItemDetail({
  item,
  onBack,
  onSelectChild,
  onNewLinked,
  onUpdate,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState(2);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!item) return null;

  function startEdit() {
    setTitle(item.title);
    setDescription(item.description || "");
    setStatus(item.status);
    setPriority(item.priority);
    setLocalError("");
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      setLocalError("Title is required.");
      return;
    }
    setSaving(true);
    setLocalError("");
    try {
      await onUpdate(item.id, {
        title: title.trim(),
        description,
        status,
        priority: Number(priority),
      });
      setEditing(false);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.title}" and all linked children?`)) return;
    await onDelete(item.id);
  }

  return (
    <div className="panel detail-panel">
      <button className="back-link" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-header">
        <div className="detail-header-row">
          <span
            className="type-tag"
            style={{ borderColor: TYPE_COLORS[item.type] }}
          >
            <span className="type-dot" style={{ background: TYPE_COLORS[item.type] }} />
            {item.type}
          </span>
          <span className="detail-id muted">#{item.id}</span>
        </div>

        {!editing ? (
          <>
            <h1>{item.title}</h1>
            {item.parent_title && (
              <p className="muted">Parent: {item.parent_title}</p>
            )}
            <div className="detail-badges">
              <span className="status-pill" style={STATUS_STYLES[item.status]}>
                {item.status}
              </span>
              <span className="priority-pill" style={PRIORITY_STYLES[item.priority]}>
                {item.priority_label}
              </span>
              <span className="muted detail-date">Created {formatDate(item.created_at)}</span>
            </div>
            {item.description ? (
              <p className="detail-description">{item.description}</p>
            ) : (
              <p className="muted">No description yet.</p>
            )}
            <div className="detail-actions">
              <button type="button" className="btn-secondary" onClick={startEdit}>
                Edit
              </button>
              <button type="button" className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <form className="detail-edit-form" onSubmit={handleSave}>
            <label className="field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Acceptance criteria, notes..."
              />
            </label>
            <div className="detail-edit-row">
              <label className="field">
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
            {localError && <p className="error-text">{localError}</p>}
            <div className="detail-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel-header section-header">
        <h2>Linked Work Items</h2>
        {item.type !== "Task" && item.type !== "Bug" && (
          <button className="btn-primary" onClick={onNewLinked}>
            + New Linked Work Item
          </button>
        )}
      </div>

      {item.children.length === 0 ? (
        <p className="muted">
          {item.type === "Task" || item.type === "Bug"
            ? "Tasks and bugs cannot have child items."
            : "No child items yet."}
        </p>
      ) : (
        <table className="work-item-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {item.children.map((child) => (
              <tr
                key={child.id}
                className="clickable-row"
                onClick={() => onSelectChild(child.id)}
              >
                <td>{child.id}</td>
                <td>{child.type}</td>
                <td className="title-cell">{child.title}</td>
                <td>
                  <span className="priority-pill" style={PRIORITY_STYLES[child.priority]}>
                    {child.priority_label}
                  </span>
                </td>
                <td>
                  <span className="status-pill" style={STATUS_STYLES[child.status]}>
                    {child.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
