import { ITERATIONS, STATUS_STYLES } from "../constants";
import WorkItemTypeIcon from "./WorkItemTypeIcon";

export default function SprintsView({ items, onSelect, onAssignIteration }) {
  const sprintItems = ITERATIONS.filter((it) => it !== "Backlog");

  return (
    <div className="panel board-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <div>
            <h1>Sprints</h1>
            <p className="panel-subtitle">Plan by iteration</p>
          </div>
        </div>

        <div className="sprint-grid">
          {sprintItems.map((sprint) => {
            const col = items.filter((i) => i.iteration === sprint);
            return (
              <section key={sprint} className="sprint-column">
                <header className="sprint-header">
                  <h2>{sprint}</h2>
                  <span className="kanban-count">{col.length}</span>
                </header>
                <div className="sprint-cards">
                  {col.length === 0 && <p className="muted kanban-empty">Empty</p>}
                  {col.map((item) => (
                    <article key={item.id} className="kanban-card" onClick={() => onSelect(item.id)}>
                      <div className="kanban-card-top">
                        <WorkItemTypeIcon type={item.type} size="sm" />
                        <span className="kanban-id">{item.id}</span>
                      </div>
                      <h3 className="kanban-card-title">{item.title}</h3>
                      <span className="status-pill" style={STATUS_STYLES[item.status]}>{item.status}</span>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="ado-section">
          <h2>Backlog</h2>
          <table className="work-item-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Move to sprint</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((i) => i.iteration === "Backlog").map((item) => (
                <tr key={item.id} className="clickable-row" onClick={() => onSelect(item.id)}>
                  <td className="mono">{item.id}</td>
                  <td className="title-cell">{item.title}</td>
                  <td>{item.type}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="sprint-assign-select"
                      value={item.iteration}
                      onChange={(e) => onAssignIteration(item.id, e.target.value)}
                    >
                      {ITERATIONS.map((it) => (
                        <option key={it} value={it}>{it}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
