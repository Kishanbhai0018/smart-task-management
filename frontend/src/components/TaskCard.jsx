import { useState, useEffect } from "react";
import { 
  FiEdit2, FiTrash2, FiCheck, FiCornerUpLeft, FiCalendar, 
  FiFolder, FiTag, FiCopy, FiArchive, FiRefreshCw, FiAlertTriangle, FiClock, FiList,
  FiPlay, FiSquare
} from "react-icons/fi";

const formatRelativeDate = (dateVal) => {
  if (!dateVal) return "";
  const now = new Date();
  const date = new Date(dateVal);
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetStart - todayStart;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const formatTime = (d) => {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  if (diffDays === 0) {
    return `Today at ${formatTime(date)}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${formatTime(date)}`;
  } else if (diffDays === 2) {
    return `In 2 Days at ${formatTime(date)}`;
  } else if (diffDays === 3) {
    return `In 3 Days at ${formatTime(date)}`;
  } else if (diffDays > 3 && diffDays <= 6) {
    return `In ${diffDays} Days at ${formatTime(date)}`;
  } else if (diffDays === 7) {
    return `Next Week at ${formatTime(date)}`;
  } else if (diffDays > 7) {
    return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${formatTime(date)}`;
  } else {
    return "Overdue";
  }
};

const TaskCard = ({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit, 
  onDuplicate, 
  onArchive, 
  onRestore, 
  allTasks = [],
  activeTimer = null,
  onStartTimer,
  onStopTimer
}) => {
  const isCompleted = task.status === "Completed";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
  if (taskDueDate) {
    taskDueDate.setHours(0,0,0,0);
  }
  const isDueToday = taskDueDate && taskDueDate.getTime() === today.getTime() && !isCompleted;
  const isUpcoming = taskDueDate && taskDueDate > today && !isCompleted && !isOverdue;

  const isTimerActive = activeTimer && activeTimer.taskId === task._id;
  const [, setCurrentTick] = useState(0);

  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setCurrentTick(prev => prev + 1);
      }, 1000);
    } else {
      setCurrentTick(0);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const getLiveActualTime = () => {
    if (!isTimerActive) return task.actualTime || 0;
    const elapsedMs = Date.now() - activeTimer.startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    return parseFloat((activeTimer.initialTime + elapsedHours).toFixed(3));
  };

  const formatTimerDisplay = () => {
    if (!isTimerActive) return "";
    const elapsedMs = Date.now() - activeTimer.startTime;
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Resolve dependencies and check if blocked
  const blockers = [];
  let isBlocked = false;

  if (task.dependencies && task.dependencies.length > 0) {
    task.dependencies.forEach(dep => {
      // Look up dependency in allTasks or populated
      const depId = typeof dep === 'object' ? dep._id : dep;
      const fullDep = allTasks.find(t => t._id === depId) || (typeof dep === 'object' ? dep : null);
      
      if (fullDep && fullDep.status !== "Completed") {
        isBlocked = true;
        blockers.push(fullDep.title);
      }
    });
  }



  // Checklist Calculations
  const checklistTotal = task.checklists ? task.checklists.length : 0;
  const checklistDone = task.checklists ? task.checklists.filter(c => c.done).length : 0;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  // Subtasks Calculations
  const subtasksTotal = task.subtasks ? task.subtasks.length : 0;
  const subtasksDone = task.subtasks ? task.subtasks.filter(s => s.status === "Completed").length : 0;

  return (
    <div className={`card task-card-premium priority-${task.priority.toLowerCase()} ${isCompleted ? "completed-state opacity-75" : ""} ${isOverdue ? "overdue-state" : ""} p-3 mb-3 border-0 shadow-sm bg-white`}>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        <div className="task-info-side flex-grow-1" style={{ maxWidth: "75%" }}>
          {/* Metadata Row */}
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap text-muted small">
            <span className="task-meta-badge">
              <span className={`task-meta-dot dot-${task.priority.toLowerCase()}`}></span>
              {task.priority}
            </span>
            <span className="task-meta-badge">
              <span className={`task-meta-dot dot-${task.status.toLowerCase().replace(" ", "")}`}></span>
              {task.status}
            </span>
            {task.category && (
              <span className="task-meta-badge">
                <FiTag size={11} className="text-muted" /> {task.category}
              </span>
            )}
            {task.project && (
              <span className="task-meta-badge">
                <FiFolder size={11} className="text-muted" /> {task.project}
              </span>
            )}
            {task.status !== "Completed" && (
              <>
                {isOverdue && task.status !== "Overdue" && (
                  <span className="task-meta-badge">
                    <span className="task-meta-dot dot-overdue"></span>
                    Overdue
                  </span>
                )}
                {!isOverdue && isDueToday && (
                  <span className="task-meta-badge">
                    <span className="task-meta-dot dot-today"></span>
                    Due Today
                  </span>
                )}
                {!isOverdue && !isDueToday && isUpcoming && (
                  <span className="task-meta-badge">
                    <span className="task-meta-dot dot-upcoming"></span>
                    Upcoming
                  </span>
                )}
              </>
            )}
          </div>

          {/* Title & Description */}
          <h5 className={`task-title-text mb-1 ${isCompleted ? "text-decoration-line-through text-muted" : "fw-semibold"}`}>
            {task.title}
          </h5>
          {task.description && (
            <p className="task-desc-text text-secondary mb-2 small">{task.description}</p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="d-flex gap-1 flex-wrap mb-2">
              {task.tags.map((tag, i) => (
                <span key={i} className="badge bg-secondary-subtle text-secondary small py-1" style={{ fontSize: "10px" }}>
                  <FiTag size={10} className="me-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Blockers alert */}
          {isBlocked && (
            <div className="alert alert-warning py-1 px-2 small mb-2 d-flex align-items-center gap-1 border-0" style={{ fontSize: "11px" }}>
              <FiAlertTriangle className="text-warning flex-shrink-0" />
              <span>Blocked by: <strong>{blockers.join(", ")}</strong></span>
            </div>
          )}

          {/* Checklists & Subtasks Progress info */}
          <div className="row g-2 mb-2">
            {checklistTotal > 0 && (
              <div className="col-sm-6">
                <div className="d-flex align-items-center justify-content-between mb-1 small text-muted">
                  <span className="d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                    <FiList size={11} /> Checklist ({checklistDone}/{checklistTotal})
                  </span>
                  <span className="fw-bold" style={{ fontSize: "11px" }}>{checklistPercent}%</span>
                </div>
                <div className="progress" style={{ height: "4px" }}>
                  <div className="progress-bar bg-success" style={{ width: `${checklistPercent}%` }}></div>
                </div>
              </div>
            )}

            {subtasksTotal > 0 && (
              <div className="col-sm-6">
                <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                  <FiList size={11} /> Subtasks completed: <strong>{subtasksDone} / {subtasksTotal}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Dates & Time metrics */}
          <div className="d-flex gap-3 flex-wrap text-muted small mt-2">
            {(task.startDate || task.dueDate) && (
              <div className="d-flex align-items-center gap-1">
                <FiCalendar size={12} />
                <span>
                  {task.startDate && new Date(task.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {task.startDate && task.dueDate && " - "}
                  {task.dueDate && formatRelativeDate(task.dueDate)}
                </span>
              </div>
            )}
            {(task.estimatedTime > 0 || task.actualTime > 0 || isTimerActive) && (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="d-flex align-items-center gap-1">
                  <FiClock size={12} className={isTimerActive ? "text-danger animate-pulse" : ""} />
                  <span>Est: {task.estimatedTime}h | Act: {getLiveActualTime().toFixed(2)}h</span>
                </div>
                {isTimerActive && (
                  <span className="badge bg-danger text-white animate-pulse" style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 6px" }}>
                    ⏱️ {formatTimerDisplay()}
                  </span>
                )}
                {!isCompleted && (
                  <button 
                    type="button"
                    className={`btn btn-xs py-0.5 px-2 rounded-pill d-flex align-items-center gap-1 ${isTimerActive ? "btn-danger text-white animate-pulse" : "btn-outline-primary"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTimerActive) {
                        onStopTimer(task._id);
                      } else {
                        onStartTimer(task._id, task.actualTime || 0);
                      }
                    }}
                    style={{ fontSize: "10px", fontWeight: "600", height: "18px", lineHeight: 1, padding: "0 8px" }}
                  >
                    {isTimerActive ? (
                      <><FiSquare size={8} /> Stop</>
                    ) : (
                      <><FiPlay size={8} /> Track</>
                    )}
                  </button>
                )}
              </div>
            )}
            {task.recurrence && task.recurrence !== "None" && (
              <span className="badge bg-info bg-opacity-10 text-info border-0 rounded">
                🔁 {task.recurrence}
              </span>
            )}
          </div>
        </div>

        {/* Actions Button Panel */}
        <div className="task-actions-side d-flex align-items-center gap-2 flex-wrap">
          {/* Complete checkbox shift button */}
          <button
            className={`task-card-btn-action btn ${isCompleted ? "btn-outline-secondary" : "btn-outline-success"}`}
            onClick={() => {
              if (isBlocked && !isCompleted) {
                alert(`Cannot complete task. Resolve dependency tasks first: ${blockers.join(", ")}`);
                return;
              }
              onToggle(task);
            }}
            disabled={isBlocked && !isCompleted}
            title={isBlocked ? "Complete blockers first" : (isCompleted ? "Reopen Task" : "Complete Task")}
          >
            {isCompleted ? <FiCornerUpLeft size={13} /> : <FiCheck size={13} />}
            <span>{isCompleted ? "Reopen" : "Complete"}</span>
          </button>

          {/* Edit (only active if not completed) */}
          {!isCompleted && onEdit && (
            <button className="task-card-btn-icon btn" onClick={() => onEdit(task)} title="Edit Task">
              <FiEdit2 size={13} />
            </button>
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <button className="task-card-btn-icon btn" onClick={() => onDuplicate(task._id)} title="Duplicate Task">
              <FiCopy size={13} />
            </button>
          )}

          {/* Archive / Restore */}
          {task.archived ? (
            onRestore && (
              <button className="task-card-btn-icon btn text-info" onClick={() => onRestore(task._id)} title="Restore Task">
                <FiRefreshCw size={13} />
              </button>
            )
          ) : (
            onArchive && (
              <button className="task-card-btn-icon btn text-warning" onClick={() => onArchive(task._id)} title="Archive Task">
                <FiArchive size={13} />
              </button>
            )
          )}

          {/* Delete */}
          <button className="task-card-btn-icon btn text-danger" onClick={() => onDelete(task._id)} title="Delete Task">
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
