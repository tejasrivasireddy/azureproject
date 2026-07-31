import { useState } from "react";
import { PRIORITY_LABELS, ITERATIONS, TEAM_MEMBERS } from "../constants";

export default function NewWorkItemModal({ allowedTypes, onClose, onCreate }) {
  const [type, setType] = useState(allowedTypes[0] || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [assignee, setAssignee] = useState("You");
  const [tags, setTags] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [iteration, setIteration] = useState("Backlog");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        title,
        type,
        description,
        priority: Number(priority),
        assignee,
        tags,
        story_points: storyPoints === "" ? null : Number(storyPoints),
        iteration,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>New Work Item</h2>
        <p className="modal-hint muted">Create a work item on your board</p>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <label className="field">
              <span>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {allowedTypes.map((t) => <option key={t} value={t}>{t}</option>)}
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
          <label className="field">
            <span>Title</span>
            <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="modal-grid">
            <label className="field">
              <span>Assigned To</span>
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
            <label className="field">
              <span>Story Points</span>
              <input type="number" min="0" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)} />
            </label>
            <label className="field">
              <span>Tags</span>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="api, ui" />
            </label>
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
