import React, { useState } from "react";
import { getTodayKey, CATEGORY_ORDER, inpStyle } from "../utils";
import { Card, CheckBox, PBar, Modal, SLabel, MarkdownRenderer } from "./SharedComponents";

const tabBtn = { 
  fontSize: 12, 
  padding: "5px 12px", 
  borderRadius: 20, 
  border: "1px solid var(--border)", 
  background: "transparent", 
  color: "var(--text-muted)", 
  cursor: "pointer" 
};

const tabActive = { 
  border: "1px solid var(--text-main)", 
  background: "var(--btn-bg)", 
  color: "var(--btn-text)", 
  fontWeight: 700 
};

const smallBtn = { 
  fontSize: 11, 
  padding: "2px 7px", 
  borderRadius: 6, 
  border: "1px solid var(--border)", 
  background: "transparent", 
  cursor: "pointer", 
  color: "var(--text-main)" 
};

export default function SkillsView({ skills, onSave }) {
  const [editSkill, setEditSkill] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [addNew, setAddNew] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "Core CS", color: "#7F77DD", topics: [], notes: "", proficiency: 0, target: 80 });
  const [view, setView] = useState("abstract"); // abstract | detail

  const cats = ["All", ...CATEGORY_ORDER];
  const filtered = filterCat === "All" ? skills : skills.filter(s => s.category === filterCat);
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const totalSkills = skills.length;
  const avgProf = totalSkills > 0 ? Math.round(skills.reduce((a, s) => a + s.proficiency, 0) / totalSkills) : 0;
  const mastered = skills.filter(s => s.proficiency >= s.target).length;

  function updateSkill(id, patch) { onSave(skills.map(s => s.id === id ? { ...s, ...patch } : s)); }
  function deleteSkill(id) { onSave(skills.filter(s => s.id !== id)); }
  function toggleTopic(skill, topic) {
    const tp = { ...skill.topicProgress, [topic]: !skill.topicProgress[topic] };
    const done = Object.values(tp).filter(Boolean).length;
    const prof = skill.topics.length > 0 ? Math.round((done / skill.topics.length) * 100) : skill.proficiency;
    updateSkill(skill.id, { topicProgress: tp, proficiency: prof, lastStudied: getTodayKey() });
  }

  function saveEditSkill() { updateSkill(editSkill.id, editSkill); setEditSkill(null); }
  function saveNew() {
    if (!newSkill.name.trim()) return;
    onSave([...skills, { ...newSkill, id: "custom-" + Date.now(), topicProgress: {}, lastStudied: null }]);
    setAddNew(false);
    setNewSkill({ name: "", category: "Core CS", color: "#7F77DD", topics: [], notes: "", proficiency: 0, target: 80 });
  }

  return (
    <div>
      {/* Abstract / Detail */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={() => setView("abstract")} style={{ ...tabBtn, ...(view === "abstract" ? tabActive : {}) }}>Abstract view</button>
        <button onClick={() => setView("detail")} style={{ ...tabBtn, ...(view === "detail" ? tabActive : {}) }}>Detailed view</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[{ v: totalSkills, l: "Total skills" }, { v: mastered, l: "Mastered" }, { v: avgProf + "%", l: "Avg proficiency" }].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {cats.map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: filterCat === c ? "1px solid var(--text-main)" : "1px solid var(--border)", background: filterCat === c ? "var(--text-main)" : "transparent", color: filterCat === c ? "var(--bg-card)" : "var(--text-muted)", cursor: "pointer" }}>{c}</button>)}
        </div>
        <button onClick={() => setAddNew(true)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: "1px solid var(--text-main)", background: "var(--btn-bg)", color: "var(--btn-text)", cursor: "pointer", fontWeight: 700 }}>+ Add skill</button>
      </div>

      {/* Abstract: radar-like grid */}
      {view === "abstract" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([cat, skillList]) => (
            <div key={cat}>
              <SLabel mt={0}>{cat}</SLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
                {skillList.map(skill => {
                  const profColor = skill.proficiency >= skill.target ? "#1D9E75" : skill.proficiency >= 50 ? "#7F77DD" : "#D85A30";
                  const topicsDone = skill.topics.filter(t => skill.topicProgress?.[t]).length;
                  return (
                    <div key={skill.id} onClick={() => setView("detail")} style={{ background: "var(--bg-card)", border: `1px solid ${skill.color}40`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: skill.color, marginTop: 5 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: profColor }}>{skill.proficiency}%</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, marginBottom: 6, lineHeight: 1.3 }}>{skill.name}</div>
                      <PBar value={skill.proficiency} max={100} color={profColor} h={3} />
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{topicsDone}/{skill.topics.length} topics</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail */}
      {view === "detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([cat, skillList]) => (
            <div key={cat}>
              <SLabel mt={0}>{cat}</SLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {skillList.map(skill => <SkillCard key={skill.id} skill={skill} onEdit={() => setEditSkill({ ...skill })} onDelete={() => deleteSkill(skill.id)} onToggle={topic => toggleTopic(skill, topic)} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {editSkill && <Modal title="Edit skill" onClose={() => setEditSkill(null)}><SkillForm skill={editSkill} onChange={setEditSkill} onSave={saveEditSkill} onClose={() => setEditSkill(null)} /></Modal>}
      {addNew && <Modal title="Add skill" onClose={() => setAddNew(false)}><SkillForm skill={newSkill} onChange={setNewSkill} onSave={saveNew} onClose={() => setAddNew(false)} isNew /></Modal>}
    </div>
  );
}

function SkillCard({ skill, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const topicsDone = skill.topics.filter(t => skill.topicProgress?.[t]).length;
  const profColor = skill.proficiency >= skill.target ? "#1D9E75" : skill.proficiency >= 50 ? "#7F77DD" : "#D85A30";
  return (
    <Card>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 4, borderRadius: 2, background: skill.color, alignSelf: "stretch", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{skill.name}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-app)", padding: "1px 6px", borderRadius: 8 }}>{skill.category}</span>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: profColor }}>{skill.proficiency}%</span>
              <button onClick={onEdit} style={smallBtn}>Edit</button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
              <span>{topicsDone}/{skill.topics.length} topics done</span>
              <span>Target: {skill.target}%</span>
            </div>
            <PBar value={skill.proficiency} max={100} color={profColor} h={5} />
          </div>
          {skill.lastStudied && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Last studied: {skill.lastStudied}</div>}
          {skill.topics.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{ fontSize: 11, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", marginTop: 8, padding: 0, fontWeight: 700 }}>
              {expanded ? "▲ Hide topics" : `▼ ${skill.topics.length} topics`}
            </button>
          )}
          {expanded && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {skill.topics.map(topic => {
                const done = !!skill.topicProgress?.[topic];
                return (
                  <div key={topic} onClick={() => onToggle(topic)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: done ? "#E1F5EE" : "var(--bg-app)", borderRadius: 8, cursor: "pointer", userSelect: "none" }}>
                    <CheckBox done={done} size={16} circle />
                    <span style={{ fontSize: 12, color: done ? "#085041" : "var(--text-main)", textDecoration: done ? "line-through" : "none" }}>{topic}</span>
                  </div>
                );
              })}
            </div>
          )}
          {skill.notes && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setNotesExpanded(e => !e)} style={{ fontSize: 11, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontWeight: 700, marginBottom: 4 }}>
                {notesExpanded ? "▲ Hide notes" : "▼ Show notes"}
              </button>
              {notesExpanded && (
                <div style={{ padding: "8px 12px", background: "var(--warning-bg)", borderRadius: 8, overflow: "hidden" }}>
                  <MarkdownRenderer text={skill.notes} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SkillForm({ skill, onChange, onSave, onClose }) {
  const [topicInput, setTopicInput] = useState("");
  function addTopic() {
    const t = topicInput.trim();
    if (!t || skill.topics.includes(t)) return;
    onChange(s => ({ ...s, topics: [...s.topics, t] }));
    setTopicInput("");
  }
  return (
    <div>
      {[{ key: "name", label: "Skill name", ph: "e.g. Spring Boot" }, { key: "category", label: "Category", ph: "e.g. Java" }].map(f => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>{f.label}</div>
          <input value={skill[f.key]} onChange={e => onChange(s => ({ ...s, [f.key]: e.target.value }))} placeholder={f.ph} style={inpStyle} />
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Proficiency: {skill.proficiency}%</div>
        <input type="range" min="0" max="100" value={skill.proficiency} onChange={e => onChange(s => ({ ...s, proficiency: +e.target.value }))} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Target: {skill.target}%</div>
        <input type="range" min="0" max="100" value={skill.target} onChange={e => onChange(s => ({ ...s, target: +e.target.value }))} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Topics</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTopic()} placeholder="Add topic, press Enter" style={{ ...inpStyle, flex: 1 }} />
          <button onClick={addTopic} style={smallBtn}>Add</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {skill.topics.map(t => (
            <span key={t} style={{ fontSize: 12, background: "#E6F1FB", color: "#185FA5", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
              {t}<span onClick={() => onChange(s => ({ ...s, topics: s.topics.filter(x => x !== t) }))} style={{ cursor: "pointer", fontWeight: 700, color: "var(--text-muted)" }}>×</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Notes</div>
        <textarea value={skill.notes || ""} onChange={e => onChange(s => ({ ...s, notes: e.target.value }))} placeholder="Resources, blockers, tips..." style={{ ...inpStyle, minHeight: 60, resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={!skill.name.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: skill.name.trim() ? "var(--text-main)" : "var(--border)", color: "var(--btn-text)", fontSize: 14, fontWeight: 700, cursor: skill.name.trim() ? "pointer" : "default" }}>Save</button>
        <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", fontSize: 14, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}
