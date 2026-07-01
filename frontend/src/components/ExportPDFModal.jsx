import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FiDownload, FiCheck, FiX, FiFileText, FiLayers, FiSliders } from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ExportPDFModal = ({ show, onHide, tasks, filteredTasks, user }) => {
  const [reportTitle, setReportTitle] = useState("SmartTask Workspace Report");
  const [customNotes, setCustomNotes] = useState("This report summarizes the task progress, priority hierarchy, and workflow statuses inside the SmartTask environment.");
  const [filterScope, setFilterScope] = useState("current"); // "current" | "all"
  const [sortBy, setSortBy] = useState("dueDateAsc"); // "dueDateAsc", "dueDateDesc", "priorityHigh", "titleAsc", "createdNew"
  
  // Layout toggles
  const [includeCover, setIncludeCover] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeDesc, setIncludeDesc] = useState(true);
  const [includeDueDate, setIncludeDueDate] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("indigo"); // "indigo", "teal", "coral", "charcoal"

  const themes = {
    indigo: {
      name: "Modern Indigo",
      primaryColor: [124, 58, 237], // #7c3aed
      lightBg: [245, 243, 255], // #f5f3ff
      accentColor: [67, 56, 202], // #4338ca
      hex: "#7c3aed",
      textHex: "#4338ca",
      bgHex: "#f5f3ff"
    },
    teal: {
      name: "Teal Professional",
      primaryColor: [13, 148, 136], // #0d9488
      lightBg: [240, 253, 250], // #f0fdfa
      accentColor: [15, 118, 110], // #0f766e
      hex: "#0d9488",
      textHex: "#0f766e",
      bgHex: "#f0fdfa"
    },
    coral: {
      name: "Sunset Coral",
      primaryColor: [249, 115, 22], // #f97316
      lightBg: [255, 247, 237], // #fff7ed
      accentColor: [194, 65, 12], // #c2410c
      hex: "#f97316",
      textHex: "#c2410c",
      bgHex: "#fff7ed"
    },
    charcoal: {
      name: "Charcoal Executive",
      primaryColor: [30, 41, 59], // #1e293b
      lightBg: [248, 250, 252], // #f8fafc
      accentColor: [15, 23, 42], // #0f172a
      hex: "#1e293b",
      textHex: "#0f172a",
      bgHex: "#f8fafc"
    }
  };

  const getSourceTasks = () => {
    return filterScope === "current" ? filteredTasks : tasks;
  };

  const getSortedTasks = (tasksList) => {
    const listCopy = [...tasksList];
    return listCopy.sort((a, b) => {
      if (sortBy === "dueDateAsc") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "dueDateDesc") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === "priorityHigh") {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      if (sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "createdNew") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  };

  const handleExport = () => {
    const sourceTasks = getSortedTasks(getSourceTasks());
    const theme = themes[selectedTheme];

    // Math statistics
    const totalCount = sourceTasks.length;
    const completedCount = sourceTasks.filter(t => t.status === "Completed").length;
    const pendingCount = totalCount - completedCount;
    const overdueCount = sourceTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status === "Pending"
    ).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // --- COVER PAGE ---
    if (includeCover) {
      // Draw top header band with background color
      doc.setFillColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
      doc.rect(0, 0, 210, 85, "F");

      // App Title Logo in Cover
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text("SmartTask Workspace", 20, 42);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text("Professional Productivity & Task Analysis Report", 20, 52);

      // Accent design stripe
      doc.setFillColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
      doc.rect(0, 85, 210, 4, "F");

      // Document Title
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      const splitTitle = doc.splitTextToSize(reportTitle || "Tasks Report Summary", 170);
      doc.text(splitTitle, 20, 115);

      // Subtitle line
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("A comprehensive summary of current workspace tasks, metrics, and targets.", 20, 132);

      // Main thin line divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 142, 190, 142);

      // Report Info Meta Columns
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("REPORT METADATA", 20, 155);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated By: ${user?.name || "Workspace User"}`, 20, 164);
      doc.text(`User Phone: ${user?.phone || "9876543210"}`, 20, 172);
      doc.text(`Date Generated: ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`, 20, 180);
      doc.text(`Source Dataset: ${filterScope === "current" ? "Active Filter View" : "All Workspace Tasks"}`, 20, 188);

      // Draw beautiful stats container card on right side of cover
      doc.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
      doc.setDrawColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(115, 150, 75, 48, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
      doc.text("WORKSPACE STATISTICS", 121, 158);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Active Tasks: ${totalCount}`, 121, 167);
      doc.text(`Completed Rate: ${completionRate}% (${completedCount}/${totalCount})`, 121, 174);
      doc.text(`Remaining Pending: ${pendingCount}`, 121, 181);
      doc.text(`Overdue Milestones: ${overdueCount}`, 121, 188);

      // Notes Callout Card
      if (customNotes) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.roundedRect(20, 212, 170, 32, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("EXECUTIVE COMMENTARY / WORKSPACE NOTES", 25, 220);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const splitNotes = doc.splitTextToSize(customNotes, 160);
        doc.text(splitNotes, 25, 228);
      }

      // Branding Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("SmartTask Workspace Automation Suite • Confidential Report", 20, 278);
    }

    // --- MAIN REPORT PAGE(S) ---
    if (includeCover) {
      doc.addPage();
    }

    // Drawing top stripe on every content page
    const pageHeader = (d) => {
      d.setFillColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
      d.rect(0, 0, 210, 14, "F");

      d.setTextColor(255, 255, 255);
      d.setFont("helvetica", "bold");
      d.setFontSize(9);
      d.text("SMARTTASK WORKSPACE EXPORT SUMMARY", 20, 9);
      
      d.setFont("helvetica", "normal");
      d.setFontSize(8);
      d.text(`Generated: ${new Date().toLocaleDateString()}`, 155, 9);
    };

    pageHeader(doc);

    // Title and stats layout
    let currentY = 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
    doc.text(reportTitle || "Active Tasks List", 20, currentY);
    currentY += 8;

    // Inline Stats boxes if cover was NOT included or requested inline
    if (includeStats) {
      doc.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
      doc.roundedRect(20, currentY, 52, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
      doc.text(`${totalCount}`, 25, currentY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Total Tasks", 25, currentY + 12);

      doc.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
      doc.roundedRect(79, currentY, 52, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
      doc.text(`${completionRate}%`, 84, currentY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Completion Rate", 84, currentY + 12);

      doc.setFillColor(theme.lightBg[0], theme.lightBg[1], theme.lightBg[2]);
      doc.roundedRect(138, currentY, 52, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(theme.accentColor[0], theme.accentColor[1], theme.accentColor[2]);
      doc.text(`${pendingCount}`, 143, currentY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Pending Tasks", 143, currentY + 12);

      currentY += 23;
    }

    // Build Table Rows
    const tableData = sourceTasks.map(task => {
      const formattedDate = task.dueDate 
        ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : "No Due Date";
      return {
        status: task.status === "Completed" ? "Completed" : "Pending",
        details: {
          title: task.title,
          desc: includeDesc && task.description ? task.description : ""
        },
        priority: task.priority,
        dueDate: includeDueDate ? formattedDate : "Hidden"
      };
    });

    // Custom cell rendering
    autoTable(doc, {
      startY: currentY,
      columns: [
        { header: "Status", dataKey: "status" },
        { header: "Task Details", dataKey: "details" },
        { header: "Priority", dataKey: "priority" },
        { header: "Due Date", dataKey: "dueDate" }
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: theme.primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "left"
      },
      bodyStyles: {
        textColor: [71, 85, 105],
        fontSize: 9,
        valign: "middle"
      },
      columnStyles: {
        status: { width: 25, halign: "center" },
        details: { width: 100 },
        priority: { width: 25, halign: "center" },
        dueDate: { width: 30, halign: "center" }
      },
      didDrawPage: (data) => {
        // Draw the top bar on subsequent pages automatically
        if (data.pageNumber > (includeCover ? 2 : 1)) {
          pageHeader(doc);
        }
      },
      willDrawCell: (data) => {
        if (data.cell.section === "body") {
          // Highlight priority
          if (data.column.key === "priority") {
            const val = data.cell.raw;
            if (val === "High") {
              data.cell.styles.textColor = [220, 38, 38]; // Red
              data.cell.styles.fontStyle = "bold";
            } else if (val === "Medium") {
              data.cell.styles.textColor = [217, 119, 6]; // Amber
              data.cell.styles.fontStyle = "bold";
            } else if (val === "Low") {
              data.cell.styles.textColor = [5, 150, 105]; // Green
              data.cell.styles.fontStyle = "bold";
            }
          }
          // Highlight status
          if (data.column.key === "status") {
            const val = data.cell.raw;
            if (val === "Completed") {
              data.cell.styles.textColor = [5, 150, 105]; // Green
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [220, 38, 38]; // Red
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      },
      didParseCell: (data) => {
        if (data.column.key === "details" && data.cell.section === "body") {
          const rawDetails = data.cell.raw;
          if (rawDetails && rawDetails.title) {
            // Combine title and description inside details column
            const lines = [rawDetails.title];
            if (rawDetails.desc) {
              lines.push(rawDetails.desc);
            }
            data.cell.text = lines;
          }
        }
      }
    });

    let finalY = doc.lastAutoTable.finalY;

    // Signature Block on the last page
    if (includeSignature) {
      if (finalY + 45 > 280) {
        doc.addPage();
        pageHeader(doc);
        finalY = 24;
      }

      currentY = finalY + 15;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(20, currentY, 190, currentY);

      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("SIGNATURE & APPROVAL", 20, currentY);

      currentY += 15;
      doc.line(20, currentY, 80, currentY);
      doc.line(120, currentY, 180, currentY);

      currentY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Authorized Signature (${user?.name || "User"})`, 20, currentY);
      doc.text("Date", 120, currentY);
    }

    // Add Page Numbers on All Pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Don't draw simple footer on cover page if cover page is present and page 1
      if (includeCover && i === 1) continue;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${totalPages}`, 175, 287);
      doc.text("Generated by SmartTask Management System Platform", 20, 287);
      
      // Bottom thin line above footer
      doc.setDrawColor(241, 245, 249);
      doc.line(20, 282, 190, 282);
    }

    const filename = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "report"}.pdf`;
    doc.save(filename);
    onHide();
  };

  const themeHex = themes[selectedTheme].hex;
  const themeTextHex = themes[selectedTheme].textHex;
  const themeBgHex = themes[selectedTheme].bgHex;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="export-pdf-modal animate-fade-in">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FiFileText className="text-primary" />
          <span>Export Tasks to Premium PDF</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-2">
        <p className="text-muted small mb-4">
          Customize structure, layouts, sorting, and premium aesthetics for your exportable task portfolio document.
        </p>

        <Row className="g-4">
          {/* Settings Column */}
          <Col md={7} className="pe-md-4 border-end-custom">
            <Form>
              {/* Document Info */}
              <div className="section-title mb-3 d-flex align-items-center gap-1">
                <FiSliders className="text-secondary" />
                <span className="fw-semibold text-secondary small text-uppercase tracking-wider">Document Settings</span>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Document Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter PDF Report Title..."
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="form-control-premium"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-secondary">Executive Notes / Commentary</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Include a brief introduction or set of notes..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="form-control-premium text-area-premium"
                />
              </Form.Group>

              {/* Data settings */}
              <Row className="mb-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Export Scope</Form.Label>
                    <Form.Select 
                      value={filterScope} 
                      onChange={(e) => setFilterScope(e.target.value)}
                      className="form-select-premium"
                    >
                      <option value="current">Current Filtered List ({filteredTasks.length})</option>
                      <option value="all">All Workspace Tasks ({tasks.length})</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Sorting Order</Form.Label>
                    <Form.Select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select-premium"
                    >
                      <option value="dueDateAsc">Due Date (Soonest first)</option>
                      <option value="dueDateDesc">Due Date (Latest first)</option>
                      <option value="priorityHigh">Priority (High to Low)</option>
                      <option value="titleAsc">Task Title (A - Z)</option>
                      <option value="createdNew">Date Created (Newest)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Themes Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-secondary d-block">Document Theme Color</Form.Label>
                <div className="d-flex align-items-center gap-3 mt-2">
                  {Object.entries(themes).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`theme-selection-btn ${selectedTheme === key ? "active" : ""}`}
                      style={{ "--theme-color": item.hex }}
                      onClick={() => setSelectedTheme(key)}
                      title={item.name}
                    >
                      {selectedTheme === key && <FiCheck className="theme-check-icon" />}
                    </button>
                  ))}
                  <span className="small text-muted fw-semibold ms-1">{themes[selectedTheme].name}</span>
                </div>
              </Form.Group>

              {/* Layout Content Toggles */}
              <div className="section-title mb-3 d-flex align-items-center gap-1">
                <FiLayers className="text-secondary" />
                <span className="fw-semibold text-secondary small text-uppercase tracking-wider">Document Inclusions</span>
              </div>

              <Row className="g-2">
                <Col sm={6}>
                  <Form.Check 
                    type="switch"
                    id="toggle-cover"
                    label="Include Cover Page"
                    checked={includeCover}
                    onChange={(e) => setIncludeCover(e.target.checked)}
                    className="custom-switch-premium"
                  />
                  <Form.Check 
                    type="switch"
                    id="toggle-stats"
                    label="Workspace Statistics"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    className="custom-switch-premium"
                  />
                  <Form.Check 
                    type="switch"
                    id="toggle-desc"
                    label="Task Description"
                    checked={includeDesc}
                    onChange={(e) => setIncludeDesc(e.target.checked)}
                    className="custom-switch-premium"
                  />
                </Col>
                <Col sm={6}>
                  <Form.Check 
                    type="switch"
                    id="toggle-due"
                    label="Due Dates"
                    checked={includeDueDate}
                    onChange={(e) => setIncludeDueDate(e.target.checked)}
                    className="custom-switch-premium"
                  />
                  <Form.Check 
                    type="switch"
                    id="toggle-sig"
                    label="Verification Signatures"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="custom-switch-premium"
                  />
                </Col>
              </Row>
            </Form>
          </Col>

          {/* PDF Interactive Preview Column */}
          <Col md={5} className="d-flex flex-column justify-content-between align-items-center preview-column-wrapper">
            <span className="small text-muted fw-semibold mb-2 self-start align-self-start">Live Style Preview</span>
            
            <div className="pdf-live-preview-box shadow">
              {includeCover ? (
                /* Cover Page Preview */
                <div className="preview-cover-flow d-flex flex-column h-100 justify-content-between">
                  <div className="preview-header-block" style={{ backgroundColor: themeHex }}>
                    <div className="preview-app-title">SmartTask</div>
                    <div className="preview-app-subtitle">Workspace Report</div>
                  </div>
                  
                  <div className="preview-body-content p-3 flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="preview-doc-title text-truncate" style={{ color: themeTextHex }}>
                        {reportTitle || "Report Title"}
                      </div>
                      <div className="preview-doc-subtitle">A comprehensive task summary.</div>
                      <hr className="my-2 preview-hr" />
                    </div>

                    <Row className="g-1 align-items-center">
                      <Col xs={6}>
                        <div className="preview-meta-title">PREPARED FOR</div>
                        <div className="preview-meta-val text-truncate">{user?.name || "Workspace User"}</div>
                        <div className="preview-meta-title mt-1">DATE</div>
                        <div className="preview-meta-val">{new Date().toLocaleDateString()}</div>
                      </Col>
                      <Col xs={6}>
                        {includeStats && (
                          <div className="preview-stats-card p-2 rounded" style={{ backgroundColor: themeBgHex }}>
                            <div className="preview-stats-rate" style={{ color: themeTextHex }}>83%</div>
                            <div className="preview-stats-desc">Completion Efficiency</div>
                          </div>
                        )}
                      </Col>
                    </Row>

                    {customNotes && (
                      <div className="preview-notes-container p-1 rounded mt-2">
                        <div className="preview-notes-title">COMMENTARY NOTES</div>
                        <div className="preview-notes-text text-truncate">{customNotes}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="preview-footer-block px-3 py-2 d-flex justify-content-between">
                    <span>Confidential Workspace Export</span>
                    <span>Page 1 of 2</span>
                  </div>
                </div>
              ) : (
                /* Content Page Preview */
                <div className="preview-content-flow d-flex flex-column h-100 justify-content-between">
                  <div>
                    <div className="preview-top-stripe" style={{ backgroundColor: themeHex }}></div>
                    <div className="p-3">
                      <div className="preview-content-title" style={{ color: themeTextHex }}>
                        {reportTitle || "Workspace Tasks List"}
                      </div>
                      
                      {includeStats && (
                        <div className="d-flex gap-2 my-2">
                          <div className="flex-grow-1 p-1 rounded text-center" style={{ backgroundColor: themeBgHex, fontSize: '7px' }}>
                            <strong style={{ color: themeTextHex }}>12</strong><br/>Total
                          </div>
                          <div className="flex-grow-1 p-1 rounded text-center" style={{ backgroundColor: themeBgHex, fontSize: '7px' }}>
                            <strong style={{ color: themeTextHex }}>83%</strong><br/>Rate
                          </div>
                          <div className="flex-grow-1 p-1 rounded text-center" style={{ backgroundColor: themeBgHex, fontSize: '7px' }}>
                            <strong style={{ color: themeTextHex }}>2</strong><br/>Pending
                          </div>
                        </div>
                      )}

                      {/* Mock Table Layout */}
                      <table className="table-preview mt-2 w-100">
                        <thead>
                          <tr style={{ backgroundColor: themeHex }}>
                            <th>Status</th>
                            <th>Task Details</th>
                            <th>Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span className="dot-preview green"></span></td>
                            <td className="fw-semibold">Deploy Frontend Server</td>
                            <td><span className="badge-preview red">High</span></td>
                          </tr>
                          <tr>
                            <td><span className="dot-preview orange"></span></td>
                            <td className="fw-semibold">Write Unit Integration Tests</td>
                            <td><span className="badge-preview yellow">Medium</span></td>
                          </tr>
                          <tr>
                            <td><span className="dot-preview green"></span></td>
                            <td className="fw-semibold">Optimize DB Indexes MERN</td>
                            <td><span className="badge-preview green">Low</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="preview-footer-block px-3 py-2 d-flex justify-content-between">
                    <span>SmartTask Document Automation</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="small text-muted text-center mt-2 px-3">
              {includeCover ? "Page 1 (Cover Page Layout) shown. Report grid starts on page 2." : "Page 1 (Content Grid Layout) shown."}
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} className="btn-premium btn-light-premium d-flex align-items-center gap-1">
          <FiX /> Cancel
        </Button>
        <Button onClick={handleExport} style={{ backgroundColor: themeHex, borderColor: themeHex }} className="btn-premium btn-primary-premium d-flex align-items-center gap-2">
          <FiDownload /> Generate Premium PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportPDFModal;
