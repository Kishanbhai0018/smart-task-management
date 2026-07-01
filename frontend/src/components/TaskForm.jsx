import { useState, useEffect } from "react";
import { FiCheckSquare, FiPlus, FiTrash2, FiClock, FiCalendar, FiList, FiAlertCircle } from "react-icons/fi";

const categories = ["Personal", "Work", "College", "Study", "Shopping", "Health", "Finance", "Fitness", "Travel", "Custom"];

const TaskForm = ({ onAdd, editingTask, onUpdateTask, onCancelEdit, tasks = [] }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    category: "Personal",
    customCategory: "",
    project: "General",
    tagsInput: "",
    startDate: "",
    dueDate: "",
    estimatedTime: 0,
    actualTime: 0,
    recurrence: "None",
    checklists: [],
    subtasks: [],
    dependencies: []
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [depSearch, setDepSearch] = useState("");
  const [showDepDropdown, setShowDepDropdown] = useState(false);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateTimeLocal = (dateVal) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };



  useEffect(() => {
    if (editingTask) {
      const isCustom = !categories.includes(editingTask.category);
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
        status: editingTask.status || "Todo",
        category: isCustom ? "Custom" : (editingTask.category || "Personal"),
        customCategory: isCustom ? editingTask.category : "",
        project: editingTask.project || "General",
        tagsInput: editingTask.tags ? editingTask.tags.join(", ") : "",
        startDate: editingTask.startDate ? editingTask.startDate.substring(0, 10) : "",
        dueDate: editingTask.dueDate ? formatDateTimeLocal(editingTask.dueDate) : "",
        estimatedTime: editingTask.estimatedTime || 0,
        actualTime: editingTask.actualTime || 0,
        recurrence: editingTask.recurrence || "None",
        checklists: editingTask.checklists || [],
        subtasks: editingTask.subtasks || [],
        dependencies: editingTask.dependencies ? editingTask.dependencies.map(d => typeof d === 'object' ? d._id : d) : []
      });
    } else {
      setForm({
        title: "",
        description: "",
        priority: "Medium",
        status: "Todo",
        category: "Personal",
        customCategory: "",
        project: "General",
        tagsInput: "",
        startDate: "",
        dueDate: "",
        estimatedTime: 0,
        actualTime: 0,
        recurrence: "None",
        checklists: [],
        subtasks: [],
        dependencies: []
      });
    }
    setNewChecklistItem("");
    setNewSubtaskTitle("");
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (form.dueDate) {
      if (new Date(form.dueDate) < new Date()) {
        setErrorToast(
          "You cannot create tasks for a past date.\nPlease select today or a future date."
        );
        return;
      }
    }

    // Process category and tags
    const finalCategory = form.category === "Custom" ? (form.customCategory || "Custom") : form.category;
    const finalTags = form.tagsInput
      ? form.tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const taskData = {
      ...form,
      category: finalCategory,
      tags: finalTags
    };

    if (editingTask) {
      onUpdateTask(editingTask._id, taskData);
    } else {
      onAdd(taskData);
    }

    // Reset Form
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      category: "Personal",
      customCategory: "",
      project: "General",
      tagsInput: "",
      startDate: "",
      dueDate: "",
      estimatedTime: 0,
      actualTime: 0,
      recurrence: "None",
      checklists: [],
      subtasks: [],
      dependencies: []
    });
    setNewChecklistItem("");
    setNewSubtaskTitle("");
  };

  // Checklist Helpers
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setForm({
      ...form,
      checklists: [...form.checklists, { text: newChecklistItem.trim(), done: false }]
    });
    setNewChecklistItem("");
  };

  const removeChecklistItem = (index) => {
    const updated = [...form.checklists];
    updated.splice(index, 1);
    setForm({ ...form, checklists: updated });
  };

  // Subtask Helpers
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setForm({
      ...form,
      subtasks: [...form.subtasks, { title: newSubtaskTitle.trim(), status: "Todo" }]
    });
    setNewSubtaskTitle("");
  };

  const removeSubtask = (index) => {
    const updated = [...form.subtasks];
    updated.splice(index, 1);
    setForm({ ...form, subtasks: updated });
  };

  const toggleSubtaskStatus = (index) => {
    const updated = [...form.subtasks];
    updated[index].status = updated[index].status === "Completed" ? "Todo" : "Completed";
    setForm({ ...form, subtasks: updated });
  };

  // Checkbox lists select mapping
  const addDependency = (taskId) => {
    if (!form.dependencies.includes(taskId)) {
      setForm({ ...form, dependencies: [...form.dependencies, taskId] });
    }
    setDepSearch("");
    setShowDepDropdown(false);
  };

  const removeDependency = (taskId) => {
    setForm({ 
      ...form, 
      dependencies: form.dependencies.filter(id => id !== taskId) 
    });
  };

  const filteredDependencyTasks = tasks.filter(t => {
    const isCurrentTask = editingTask && t._id === editingTask._id;
    const isAlreadySelected = form.dependencies.includes(t._id);
    const matchesSearch = t.title.toLowerCase().includes(depSearch.toLowerCase());
    return !isCurrentTask && !isAlreadySelected && matchesSearch;
  });

  return (
    <div className="card p-4 shadow-sm border-0 mb-4 bg-white task-form-container premium-ui-form">
      <h5 className="fw-bold mb-3 text-secondary d-flex align-items-center justify-content-between">
        <span className="d-flex align-items-center gap-2">
          <FiCheckSquare className="text-primary" />
          {editingTask ? "Edit Smart Task" : "Create New Smart Task"}
        </span>
        {editingTask && (
          <button className="btn btn-sm btn-outline-secondary py-1" type="button" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Title and Description */}
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Title *</label>
            <input
              className="form-control"
              placeholder="E.g., Design UI layout"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Description</label>
            <input
              className="form-control"
              placeholder="E.g., Complete dashboard prototype Figma sheets"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Project, Category, Tags */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Project Name</label>
            <input
              className="form-control"
              placeholder="General"
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {form.category === "Custom" && (
              <input
                className="form-control mt-2"
                placeholder="Enter custom category"
                value={form.customCategory}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                required
              />
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Tags (separated by comma)</label>
            <input
              className="form-control"
              placeholder="ui, sprint1, critical"
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
            />
          </div>

          {/* Priority & Status */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Priority</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Start and Due Date */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
              <FiCalendar size={13} /> Start Date
            </label>
            <input
              type="date"
              className="form-control"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              min={getTodayDateString()}
            />
          </div>
 
          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
              <FiCalendar size={13} /> Due Date
            </label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              min={formatDateTimeLocal(new Date())}
            />
          </div>

          {/* Estimations */}
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
              <FiClock size={13} /> Est. Time (Hours)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              className="form-control"
              value={form.estimatedTime}
              onChange={(e) => setForm({ ...form, estimatedTime: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Recurrence & Dependencies */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Recurrence</label>
            <select
              className="form-select"
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
            >
              <option value="None">None</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="col-md-6 position-relative">
            <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
              <FiAlertCircle size={13} /> Task Dependencies
            </label>
            <div className="d-flex flex-wrap gap-1 mb-2" style={{ minHeight: "26px" }}>
              {form.dependencies.length === 0 && (
                <span className="text-muted small">No dependencies selected.</span>
              )}
              {form.dependencies.map(id => {
                const depTask = tasks.find(t => t._id === id);
                if (!depTask) return null;
                return (
                  <span key={id} className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2.5 rounded-pill" style={{ fontSize: "11px" }}>
                    {depTask.title}
                    <button 
                      type="button" 
                      className="btn-close" 
                      style={{ fontSize: "8px", padding: 0 }} 
                      onClick={() => removeDependency(id)}
                      aria-label="Remove"
                    />
                  </span>
                );
              })}
            </div>
            <input 
              type="text"
              className="form-control form-control-sm"
              placeholder="Search and select tasks..."
              value={depSearch}
              onChange={(e) => {
                setDepSearch(e.target.value);
                setShowDepDropdown(true);
              }}
              onFocus={() => setShowDepDropdown(true)}
            />
            {showDepDropdown && depSearch.trim() !== "" && (
              <div className="position-absolute bg-white border rounded shadow-sm w-100 mt-1 overflow-auto animate-fade-in" style={{ maxHeight: "150px", zIndex: 1000, left: 12, right: 12 }}>
                {filteredDependencyTasks.length === 0 ? (
                  <div className="p-2 text-muted small">No tasks found</div>
                ) : (
                  filteredDependencyTasks.map(t => (
                    <div 
                      key={t._id}
                      className="p-2 dropdown-item small border-bottom"
                      onClick={() => addDependency(t._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {t.title} <span className="text-muted text-uppercase" style={{ fontSize: "9px" }}>({t.status})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Checklist & Subtasks Arrays */}
          <div className="col-md-6">
            <div className="card p-3 border border-secondary border-opacity-10 rounded-3 bg-light h-100">
              <span className="fw-bold small text-secondary mb-2 d-flex align-items-center gap-1">
                <FiList size={13} /> Checklist
              </span>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" type="button" onClick={addChecklistItem}>
                  <FiPlus />
                </button>
              </div>
              <ul className="list-group list-group-flush overflow-auto small" style={{ maxHeight: "110px" }}>
                {form.checklists.map((item, idx) => (
                  <li key={idx} className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-1 py-1">
                    <span className={item.done ? "text-decoration-line-through text-muted" : ""}>{item.text}</span>
                    <button className="btn btn-link text-danger p-0" type="button" onClick={() => removeChecklistItem(idx)}>
                      <FiTrash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 border border-secondary border-opacity-10 rounded-3 bg-light h-100">
              <span className="fw-bold small text-secondary mb-2 d-flex align-items-center gap-1">
                <FiCheckSquare size={13} /> Subtasks
              </span>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add subtask title..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" type="button" onClick={addSubtask}>
                  <FiPlus />
                </button>
              </div>
              <ul className="list-group list-group-flush overflow-auto small" style={{ maxHeight: "110px" }}>
                {form.subtasks.map((sub, idx) => (
                  <li key={idx} className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-1 py-1">
                    <span 
                      onClick={() => toggleSubtaskStatus(idx)} 
                      className={`cursor-pointer ${sub.status === "Completed" ? "text-decoration-line-through text-muted" : ""}`}
                      title="Click to toggle status"
                    >
                      {sub.title}
                    </span>
                    <button className="btn btn-link text-danger p-0" type="button" onClick={() => removeSubtask(idx)}>
                      <FiTrash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="col-12 text-end mt-4">
            <button className="btn btn-primary px-5 py-2 fw-semibold" type="submit" style={{ borderRadius: "8px" }}>
              {editingTask ? "Save Task Changes" : "Create Task"}
            </button>
          </div>
        </div>
      </form>
 
      {/* Toast Alert */}
      {errorToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show align-items-center text-white bg-danger border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" style={{ borderRadius: "10px" }}>
            <div className="d-flex p-2">
              <div className="toast-body fw-medium" style={{ whiteSpace: "pre-line" }}>
                {errorToast}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setErrorToast("")}></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
