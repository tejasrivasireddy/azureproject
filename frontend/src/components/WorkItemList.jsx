import { useMemo, useState } from "react";
import {
  STATUS_STYLES,
  STATUSES,
  formatDate,
  parseTags,
  CURRENT_USER,
} from "../constants";
import WorkItemTypeIcon from "./WorkItemTypeIcon";

export default function WorkItemList({ items, onSelect, onNew }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        String(item.id).includes(q);
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, search, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    mine: items.filter((i) => i.assignee === CURRENT_USER).length,
    active: items.filter((i) => i.status === "Active").length,
    bugs: items.filter((i) => i.type === "Bug").length,
  }), [items]);

  return (
    <div className="panel">
      <div className="panel-inner">
        <div className="panel-header">
          <div>
            <h1>Work items</h1>
            <p className="panel-subtitle">Recently updated</p>
          </div>
          <button type="button" className="btn-primary" onClick={onNew}>New work item</button>
        </div>

        <div className="stats-row">
          <div className="stat-card"><span className="stat-value">{stats.total}</span><span className="stat-label">All</span></div>
          <div className="stat-card"><span className="stat-value">{stats.mine}</span><span className="stat-label">Assigned to me</span></div>
          <div className="stat-card"><span className="stat-value">{stats.active}</span><span className="stat-label">Active</span></div>
          <div className="stat-card"><span className="stat-value">{stats.bugs}</span><span className="stat-label">Bugs</span></div>
        </div>

        <div className="filter-bar">
          <label className="filter-field grow">
            <span>Keyword</span>
            <input type="search" placeholder="Search title or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="filter-field">
            <span>Type</span>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {["Epic", "Feature", "User Story", "Task", "Bug"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>State</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All states</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <table className="work-item-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>State</th>
              <th>Assigned to</th>
              <th>Iteration</th>
              <th>Points</th>
              <th>Changed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-row">
                  {items.length === 0 ? "No work items yet." : "No matching work items."}
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => onSelect(item.id)} className="clickable-row">
                <td className="mono">{item.id}</td>
                <td>
                  <div className="type-cell">
                    <WorkItemTypeIcon type={item.type} size="sm" />
                    <span className="type-label">{item.type}</span>
                  </div>
                </td>
                <td className="title-cell">
                  {item.title}
                  {parseTags(item.tags).length > 0 && (
                    <span className="row-tags">
                      {parseTags(item.tags).map((t) => <span key={t} className="ado-tag">{t}</span>)}
                    </span>
                  )}
                </td>
                <td>
                  <span className="status-pill" style={STATUS_STYLES[item.status]}>{item.status}</span>
                </td>
                <td>{item.assignee || "—"}</td>
                <td className="muted">{item.iteration}</td>
                <td>{item.story_points ?? "—"}</td>
                <td className="date-cell">{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
