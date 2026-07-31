import { STATUS_STYLES } from "../constants";
import WorkItemTypeIcon from "./WorkItemTypeIcon";

export default function BacklogsView({ items, onSelect, onNew }) {
  const roots = items.filter((i) => !i.parent_id);
  const byParent = items.reduce((acc, item) => {
    if (item.parent_id) {
      if (!acc[item.parent_id]) acc[item.parent_id] = [];
      acc[item.parent_id].push(item);
    }
    return acc;
  }, {});

  function renderNode(item, depth = 0) {
    const children = byParent[item.id] || [];
    return (
      <div key={item.id} className="backlog-node" style={{ marginLeft: depth * 16 }}>
        <button type="button" className="backlog-row" onClick={() => onSelect(item.id)}>
          <WorkItemTypeIcon type={item.type} size="sm" />
          <span className="backlog-title">{item.id} · {item.title}</span>
          <span className="status-pill" style={STATUS_STYLES[item.status]}>{item.status}</span>
          {item.story_points != null && <span className="points-chip">{item.story_points}</span>}
        </button>
        {children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-inner">
        <div className="panel-header">
          <div>
            <h1>Backlogs</h1>
            <p className="panel-subtitle">Portfolio hierarchy</p>
          </div>
          <button type="button" className="btn-primary" onClick={onNew}>New work item</button>
        </div>

        {roots.length === 0 ? (
          <p className="muted empty-row">No items. Create an Epic to start.</p>
        ) : (
          <div className="backlog-tree">{roots.map((root) => renderNode(root))}</div>
        )}
      </div>
    </div>
  );
}
