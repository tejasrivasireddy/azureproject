import { useState } from "react";
import {
  STATUS_STYLES,
  STATUSES,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  ITERATIONS,
  TEAM_MEMBERS,
  formatDate,
  parseTags,
} from "../constants";
import WorkItemTypeIcon from "./WorkItemTypeIcon";

export default function WorkItemPanel({
  item,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  onSelectChild,
  onNewLinked,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState(2);
  const [assignee, setAssignee] = useState("Unassigned");
  const [tags, setTags] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [iteration, setIteration] = useState("Backlog");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!item) return null;

  function startEdit() {
    setTitle(item.title);
    setDescription(item.description || "");
    setStatus(item.status);
    setPriority(item.priority);
    setAssignee(item.assignee || "Unassigned");
    setTags(item.tags || "");
    setStoryPoints(item.story_points ?? "");
    setIteration(item.iteration || "Backlog");
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
        assignee,
        tags,
        story_points: storyPoints === "" ? null : Number(storyPoints),
        iteration,
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

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await onAddComment(item.id, comment.trim());
    setComment("");
  }

  const tagList = parseTags(item.tags);

  return (
    <div className="ado-panel-overlay" onClick={onClose}>
      <aside className="ado-panel" onClick={(e) => e.stopPropagation()}>
        <header className="ado-panel-header">
          <div className="ado-panel-title-row">
            <WorkItemTypeIcon type={item.type} size="lg" />
            <div>
              <span className="ado-panel-meta">{item.type} {item.id}</span>
              {!editing && <h2 className="ado-panel-title">{item.title}</h2>}
            </div>
          </div>
          <button type="button" className="ado-panel-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="ado-panel-body">
          {!editing ? (
            <>
              <div className="ado-field-grid">
                <Field label="State">
                  <span className="status-pill" style={STATUS_STYLES[item.status]}>{item.status}</span>
                </Field>
                <Field label="Priority">
                  <span className="priority-pill" style={PRIORITY_STYLES[item.priority]}>{item.priority_label}</span>
                </Field>
                <Field label="Assigned to">{item.assignee || "Unassigned"}</Field>
                <Field label="Iteration">{item.iteration}</Field>
                <Field label="Story Points">{item.story_points ?? "—"}</Field>
                <Field label="Parent">{item.parent_title || "—"}</Field>
                <Field label="Created">{formatDate(item.created_at)}</Field>
              </div>

              {tagList.length > 0 && (
                <div className="ado-tags">
                  {tagList.map((t) => <span key={t} className="ado-tag">{t}</span>)}
                </div>
              )}

              <section className="ado-section">
                <h3>Description</h3>
                <p className="ado-description">{item.description || "No description provided."}</p>
              </section>

              <div className="detail-actions">
                <button type="button" className="btn-secondary" onClick={startEdit}>Edit</button>
                {item.type !== "Task" && item.type !== "Bug" && (
                  <button type="button" className="btn-secondary" onClick={onNewLinked}>Add link</button>
                )}
                <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
              </div>

              {item.children?.length > 0 && (
                <section className="ado-section">
                  <h3>Child items</h3>
                  <ul className="ado-child-list">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <button type="button" className="ado-child-link" onClick={() => onSelectChild(c.id)}>
                          {c.id} · {c.type} · {c.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="ado-section">
                <h3>Discussion</h3>
                <form className="ado-comment-form" onSubmit={handleComment}>
                  <textarea rows={2} placeholder="Add a comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button type="submit" className="btn-primary btn-sm">Add comment</button>
                </form>
                <div className="ado-comments">
                  {(item.comments || []).length === 0 && <p className="muted">No comments yet.</p>}
                  {(item.comments || []).map((c) => (
                    <article key={c.id} className="ado-comment">
                      <div className="ado-comment-head">
                        <strong>{c.author}</strong>
                        <span className="muted">{formatDate(c.created_at)}</span>
                      </div>
                      <p>{c.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <form className="detail-edit-form" onSubmit={handleSave}>
              <label className="field">
                <span>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <div className="detail-edit-row">
                <label className="field">
                  <span>State</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="detail-edit-row">
                <label className="field">
                  <span>Assigned to</span>
                  <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                    {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Iteration</span>
                  <select value={iteration} onChange={(e) => setIteration(e.target.value)}>
                    {ITERATIONS.map((it) => <option key={it} value={it}>{it}</option>)}
                  </select>
                </label>
              </div>
              <div className="detail-edit-row">
                <label className="field">
                  <span>Story Points</span>
                  <input type="number" min="0" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)} />
                </label>
                <label className="field">
                  <span>Tags</span>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="frontend, api" />
                </label>
              </div>
              {localError && <p className="error-text">{localError}</p>}
              <div className="detail-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="ado-field">
      <span className="ado-field-label">{label}</span>
      <div className="ado-field-value">{children}</div>
    </div>
  );
}
