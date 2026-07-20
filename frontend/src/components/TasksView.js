import React, { useState } from "react";
import { DEFAULT_TASKS, inpStyle } from "../utils";
import { Card, Modal, SLabel } from "./SharedComponents";

const smallBtn = { 
  fontSize: 11, 
  padding: "2px 7px", 
  borderRadius: 6, 
  border: "1px solid var(--border)", 
  background: "transparent", 
  cursor: "pointer", 
  color: "var(--text-main)" 
};

export default function TasksView({ customTasks, onSave, onReset }) {
  const [editTask, setEditTask] = useState(null);
  const [showReset, setShowReset] = useState(false);

  function saveTask(task) {
    if (task.id === "__new__") onSave([...customTasks, { ...task, id: "custom-" + Date.now() }]);
    else onSave(customTasks.map(t => t.id === task.id ? task : t));
    setEditTask(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SLabel mt={0}>Daily practice tasks</SLabel>
        <button onClick={() => setEditTask({ id: "__new__", label: "", category: "", duration: "", detail: "" })} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: "1px solid var(--text-main)", background: "var(--btn-bg)", color: "var(--btn-text)", cursor: "pointer", fontWeight: 700 }}>+ Add task</button>
      </div>
      <SLabel mt={0}>Default (always on)</SLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {DEFAULT_TASKS.map(t => (
          <Card key={t.id} style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{t.detail}</div></div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 10, flexShrink: 0 }}>{t.duration}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 5, fontWeight: 700, textTransform: "uppercase" }}>{t.category}</div>
          </Card>
        ))}
      </div>
      {customTasks.length > 0 && (
        <>
          <SLabel>Custom tasks</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {customTasks.map(t => (
              <Card key={t.id} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{t.detail}</div></div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.duration}</span>
                    <button onClick={() => setEditTask(t)} style={smallBtn}>Edit</button>
                    <button onClick={() => onSave(customTasks.filter(x => x.id !== t.id))} style={{ ...smallBtn, borderColor: "var(--danger-text)", color: "var(--danger-text)" }}>Del</button>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 5, fontWeight: 700, textTransform: "uppercase" }}>{t.category}</div>
              </Card>
            ))}
          </div>
        </>
      )}
      <div style={{ marginTop: 24, borderTop: "1px solid var(--bg-app)", paddingTop: 16 }}>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} style={{ fontSize: 12, color: "var(--danger-text)", background: "transparent", border: "1px solid var(--danger-text)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>Reset 60-day progress</button>
        ) : (
          <Card style={{ background: "var(--danger-bg)", borderColor: "var(--danger-text)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger-text)", marginBottom: 6 }}>Reset all progress?</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Clears daily completions and notes. Skills and custom tasks are kept.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onReset(); setShowReset(false); }} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "none", background: "var(--danger-text)", color: "var(--btn-text)", cursor: "pointer", fontWeight: 700 }}>Yes, reset</button>
              <button onClick={() => setShowReset(false)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", cursor: "pointer" }}>Cancel</button>
            </div>
          </Card>
        )}
      </div>
      {editTask && (
        <Modal title={editTask.id === "__new__" ? "Add task" : "Edit task"} onClose={() => setEditTask(null)}>
          <div>
            {[{ k: "label", l: "Task name", p: "e.g. Read Kleppmann chapter" }, { k: "category", l: "Category", p: "e.g. System Design" }, { k: "duration", l: "Duration", p: "e.g. 30 min" }].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>{f.l}</div>
                <input value={editTask[f.k]} onChange={e => setEditTask(t => ({ ...t, [f.k]: e.target.value }))} placeholder={f.p} style={inpStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Detail</div>
              <textarea value={editTask.detail} onChange={e => setEditTask(t => ({ ...t, detail: e.target.value }))} placeholder="What exactly to do..." style={{ ...inpStyle, minHeight: 60, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => saveTask(editTask)} disabled={!editTask.label.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: editTask.label.trim() ? "var(--text-main)" : "var(--border)", color: "var(--btn-text)", fontSize: 14, fontWeight: 700, cursor: editTask.label.trim() ? "pointer" : "default" }}>Save</button>
              <button onClick={() => setEditTask(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
