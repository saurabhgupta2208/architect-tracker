import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { BADGE_COLORS, inpStyle, formatTime } from "../utils";

export function CheckBox({ done, size = 20, circle = false }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.2px solid ${done ? "var(--text-main)" : "var(--border)"}`,
      borderRadius: circle ? "50%" : 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: done ? "var(--text-main)" : "transparent",
      cursor: "pointer", transition: "all 0.1s"
    }}>
      {done && <svg width={size*0.7} height={size*0.7} viewBox="0 0 24 24" fill="none" stroke="var(--bg-card)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
    </div>
  );
}

export function PBar({ value, max, color = "#7F77DD", h = 5 }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ background: "var(--border)", borderRadius: h, height: h, overflow: "hidden" }}>
      <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: h, transition: "width 0.4s ease" }} />
    </div>
  );
}

export function Card({ children, style = {} }) {
  return <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, boxSizing: "border-box", ...style }}>{children}</div>;
}

export function SLabel({ children, mt = 16 }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: mt, marginBottom: 8 }}>{children}</div>;
}

export function Badge({ type }) {
  const colors = BADGE_COLORS[type] || { bg: "var(--border)", text: "var(--text-muted)" };
  return <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", background: colors.bg, color: colors.text, padding: "2px 6px", borderRadius: 4 }}>{type}</span>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ fontSize: 22, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SettingsModal({ data, onSave, onClose }) {
  const [start, setStart] = useState(data.settings.startDate);
  const [days, setDays] = useState(data.settings.totalDays);
  const [theme, setTheme] = useState(data.settings.theme || 'dark');
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <Card style={{ width: 340, padding: 24 }}>
        <h3 style={{ margin: "0 0 16px 0" }}>Settings</h3>
        
        <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--text-main)" }}>App Settings</h4>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Program Start Date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inpStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Total Duration (Days)</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} style={inpStyle} />
        </div>

        <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--text-main)", borderTop: "1px solid var(--border)", paddingTop: 16 }}>UI / Global Settings</h4>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={inpStyle}>
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onSave({ startDate: start, totalDays: days, theme })} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--btn-bg)", color: "var(--btn-text)", border: "none", cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "var(--btn-bg-alt)", color: "var(--btn-text-alt)", border: "none", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
        </div>
      </Card>
    </div>
  );
}

// ─── MERMAID DIAGRAM RENDERER ─────────────────────────────────
let mermaidCounter = 0;

function MermaidRenderer({ chart }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const elementId = useRef(`mermaid-chart-${Date.now()}-${mermaidCounter++}`).current;

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setSvg("");

    const renderDiagram = async () => {
      try {
        const isDark = document.body.classList.contains("dark-theme");
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          themeVariables: isDark ? {
            background: "#1e1e2e",
            primaryColor: "#313244",
            primaryTextColor: "#cdd6f4",
            lineColor: "#a6adc8",
          } : {}
        });

        // Clear any previous elements in the temp div to avoid IDs conflicts
        const container = document.createElement("div");
        container.id = `temp-${elementId}`;
        container.style.display = "none";
        document.body.appendChild(container);

        const result = mermaid.render(elementId, chart, container);
        if (result instanceof Promise) {
          const { svg: renderedSvg } = await result;
          if (isMounted) {
            setSvg(renderedSvg);
          }
        } else {
          const renderedSvg = typeof result === "string" ? result : result.svg;
          if (isMounted) {
            setSvg(renderedSvg);
          }
        }
        
        container.remove();
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render Mermaid diagram");
        }
        const tempContainer = document.getElementById(`temp-${elementId}`);
        if (tempContainer) tempContainer.remove();
        const badEl = document.getElementById(elementId);
        if (badEl) badEl.remove();
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      const tempContainer = document.getElementById(`temp-${elementId}`);
      if (tempContainer) tempContainer.remove();
      const badEl = document.getElementById(elementId);
      if (badEl) badEl.remove();
    };
  }, [chart, elementId]);

  if (error) {
    return (
      <div style={{ border: "1px solid #ef4444", borderRadius: 8, padding: 12, margin: "16px 0", background: "rgba(239, 68, 68, 0.05)" }}>
        <div style={{ color: "#ef4444", fontWeight: "bold", fontSize: 12, marginBottom: 8 }}>⚠️ Mermaid Render Error:</div>
        <pre style={{ margin: 0, fontSize: 11.5, fontFamily: "monospace", overflowX: "auto", color: "var(--text-muted)", whiteSpace: "pre" }}>{chart}</pre>
        <div style={{ color: "#ef4444", fontSize: 11, marginTop: 6 }}>{error}</div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0", color: "var(--text-muted)", fontSize: 12 }}>
        <span>⏳ Rendering diagram...</span>
      </div>
    );
  }

  return (
    <div 
      className="mermaid-svg-container"
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        margin: "20px 0", 
        background: "var(--bg-sidebar)", 
        padding: 16, 
        borderRadius: 8, 
        border: "1px solid var(--border)", 
        overflowX: "auto" 
      }} 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}

// ─── MARKDOWN RENDERER ────────────────────────────────────────
export function MarkdownRenderer({ text }) {
  if (!text) return <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No content yet. Click Edit to add some notes.</div>;

  // Step 1: Split raw text into alternating [text, code, text, code...] segments
  const CODE_BLOCK_RE = /```(\w*)\n?([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let m;
  while ((m = CODE_BLOCK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, m.index) });
    }
    segments.push({ type: 'code', lang: m[1] || '', content: m[2].replace(/^\n|\n$/g, '') });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  // Step 2: Run markdown processing on a plain-text segment only
  function processText(raw) {
    let html = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const extractMap = [];
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const id = extractMap.length;
      extractMap.push(`<img src="${url}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin: 12px 0; display: block;" />`);
      return `@@EXTRACT${id}@@`;
    });

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const id = extractMap.length;
      extractMap.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--link-color); text-decoration: underline; font-weight: 500;">${text}</a>`);
      return `@@EXTRACT${id}@@`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background: var(--bg-sidebar); padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--code-color);">$1</code>');
    // Headings
    html = html.replace(/^# (.*?)$/gm,   '<h1 style="font-size: 1.6em; margin: 24px 0 12px; font-weight: 800; border-bottom: 1px solid var(--border); padding-bottom: 6px; color: var(--text-main);">$1</h1>');
    html = html.replace(/^## (.*?)$/gm,  '<h2 style="font-size: 1.3em; margin: 20px 0 10px; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 4px; color: var(--text-main);">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.1em; margin: 16px 0 8px; font-weight: 700; color: var(--text-main);">$1</h3>');
    html = html.replace(/^#### (.*?)$/gm,'<h4 style="font-size: 1em; margin: 12px 0 6px; font-weight: 700; color: var(--text-main);">$1</h4>');
    // HR
    html = html.replace(/^---$/gm, '<hr style="border: 0; border-top: 1px solid var(--border); margin: 20px 0;" />');
    // Blockquotes
    html = html.replace(/^&gt;[ ]?(.*?)$/gm, '<blockquote style="border-left: 4px solid #7F77DD; padding-left: 12px; margin: 12px 0; color: var(--text-muted); font-style: italic;">$1</blockquote>');
    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Tables
    const tLines = html.split('\n');
    let inTable = false, tHeaders = [], tRows = [], tParsed = [];
    for (let i = 0; i < tLines.length; i++) {
      const line = tLines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const parts = line.split('|').map(s => s.trim()).filter((_, j, a) => j > 0 && j < a.length - 1);
        if (!inTable) { inTable = true; tHeaders = parts; }
        else if (parts.every(p => p.startsWith('-') || p.startsWith(':'))) { /* skip divider */ }
        else { tRows.push(parts); }
      } else {
        if (inTable) {
          let th = '<div style="overflow-x:auto;margin:16px 0"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr style="border-bottom:2px solid var(--border)">';
          tHeaders.forEach(h => { th += `<th style="padding:8px 12px;font-weight:700;background:var(--bg-sidebar);border:1px solid var(--border)">${h}</th>`; });
          th += '</tr></thead><tbody>';
          tRows.forEach(row => { th += '<tr style="border-bottom:1px solid var(--border)">'; row.forEach(c => { th += `<td style="padding:8px 12px;border:1px solid var(--border)">${c}</td>`; }); th += '</tr>'; });
          th += '</tbody></table></div>';
          tParsed.push(th); inTable = false; tHeaders = []; tRows = [];
        }
        tParsed.push(tLines[i]);
      }
    }
    if (inTable) {
      let th = '<div style="overflow-x:auto;margin:16px 0"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr style="border-bottom:2px solid var(--border)">';
      tHeaders.forEach(h => { th += `<th style="padding:8px 12px;font-weight:700;background:var(--bg-sidebar);border:1px solid var(--border)">${h}</th>`; });
      tHeaders.forEach(h => { th += `<th style="padding:8px 12px;font-weight:700;background:var(--bg-sidebar);border:1px solid var(--border)">${h}</th>`; });
      th += '</tr></thead><tbody>';
      tRows.forEach(row => { th += '<tr style="border-bottom:1px solid var(--border)">'; row.forEach(c => { th += `<td style="padding:8px 12px;border:1px solid var(--border)">${c}</td>`; }); th += '</tr>'; });
      th += '</tbody></table></div>';
      tParsed.push(th);
    }

    // Restore extracts
    let finalHtml = tParsed.join('\n');
    for (let i = 0; i < extractMap.length; i++) {
      finalHtml = finalHtml.replace(`@@EXTRACT${i}@@`, extractMap[i]);
    }
    return finalHtml;
  }

  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-main)" }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'code') {
          if (seg.lang === 'mermaid') {
            return <MermaidRenderer key={idx} chart={seg.content} />;
          }
          return (
            <pre key={idx} style={{ background: "var(--bg-sidebar)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, overflowX: "auto", margin: "16px 0", fontSize: 12.5, fontFamily: "monospace", color: "var(--code-color)", lineHeight: 1.5 }}>
              <code className={seg.lang ? `language-${seg.lang}` : ''}>{seg.content}</code>
            </pre>
          );
        }
        return <div key={idx} dangerouslySetInnerHTML={{ __html: processText(seg.content) }} style={{ whiteSpace: "pre-wrap" }} />;
      })}
    </div>
  );
}

export function DailyNotesSection({ notes = [], onUpdate }) {
  const [txt, setTxt] = useState("");
  const addNote = () => {
    if (!txt.trim()) return;
    const newNote = { id: Date.now(), text: txt, time: new Date().toISOString() };
    onUpdate([newNote, ...notes]);
    setTxt("");
  };
  const deleteNote = (id) => onUpdate(notes.filter(n => n.id !== id));

  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: 13, marginBottom: 12 }}>Daily Logs</h4>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Add a log entry for today..." style={{ ...inpStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addNote()} />
        <button onClick={addNote} style={{ padding: "0 15px", borderRadius: 8, background: "var(--btn-bg)", color: "var(--btn-text)", border: "none", fontSize: 12, cursor: "pointer" }}>Submit</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.length === 0 && <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No notes for today yet.</div>}
        {notes.map(n => (
          <div key={n.id} style={{ background: "var(--bg-sidebar)", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.text}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
              <span>{n.time === "Migrated" ? "Legacy" : formatTime(n.time)}</span>
              <span onClick={() => deleteNote(n.id)} style={{ color: "#D85A30", cursor: "pointer" }}>Remove</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyPlanSection({ plan = [], onUpdate }) {
  const [txt, setTxt] = useState("");
  const add = () => { if (!txt.trim()) return; onUpdate([...plan, { id: Date.now(), text: txt, achieved: false }]); setTxt(""); };
  const toggle = (id) => onUpdate(plan.map(p => p.id === id ? { ...p, achieved: !p.achieved } : p));
  const remove = (id) => onUpdate(plan.filter(p => p.id !== id));
  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: 13, marginBottom: 12 }}>Plan vs Reality</h4>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="What do you plan to achieve?" style={{ ...inpStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && add()} />
        <button onClick={add} style={{ padding: "0 15px", borderRadius: 8, background: "var(--btn-bg)", color: "var(--btn-text)", border: "none", fontSize: 12, cursor: "pointer" }}>Plan It</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: p.achieved ? "var(--success-bg)" : "var(--bg-card)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <input type="checkbox" checked={p.achieved} onChange={() => toggle(p.id)} style={{ cursor: "pointer" }} />
            <span style={{ flex: 1, fontSize: 13, textDecoration: p.achieved ? "line-through" : "none", color: p.achieved ? "var(--success-text)" : "var(--text-main)" }}>{p.text}</span>
            <span onClick={() => remove(p.id)} style={{ color: "#D85A30", cursor: "pointer", fontSize: 14 }}>×</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GeneralNotesSidebar({ data = [], onUpdate }) {
  const [txt, setTxt] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [expandedNoteIds, setExpandedNoteIds] = useState(new Set());

  const toggleExpand = (id) => {
    const next = new Set(expandedNoteIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNoteIds(next);
  };

  const handleSaveOrUpdate = () => {
    if (!txt.trim()) return;
    
    if (editingNoteId !== null) {
      // Update existing note
      const updated = data.map(n => {
        if (n.id === editingNoteId) {
          const lines = txt.split("\n").map(l => l.trim()).filter(Boolean);
          const title = lines.length > 0 ? lines[0].replace(/^#+[ ]+/, "").substring(0, 50) : "Quick Note";
          return { ...n, title, text: txt, time: new Date().toISOString() };
        }
        return n;
      });
      onUpdate(updated);
      setEditingNoteId(null);
    } else {
      // Add new note
      const lines = txt.split("\n").map(l => l.trim()).filter(Boolean);
      const title = lines.length > 0 ? lines[0].replace(/^#+[ ]+/, "").substring(0, 50) : "Quick Note";
      const newNote = {
        id: Date.now(),
        title: title,
        text: txt,
        category: "General",
        time: new Date().toISOString(),
        pinned: false
      };
      onUpdate([newNote, ...data]);
    }
    setTxt("");
  };

  const startEdit = (n, e) => {
    e.stopPropagation();
    setEditingNoteId(n.id);
    setTxt(n.text);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setTxt("");
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete note?")) {
      onUpdate(data.filter(x => x.id !== id));
      if (editingNoteId === id) {
        cancelEdit();
      }
    }
  };

  return (
    <div style={{ width: 260, borderRight: "1px solid var(--border)", background: "var(--bg-sidebar)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>General Notes</h3>
      </div>
      <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
        <textarea 
          value={txt} 
          onChange={e => setTxt(e.target.value)} 
          placeholder={editingNoteId ? "Edit your note..." : "Quick note... (Press save)"} 
          style={{ ...inpStyle, height: 80, resize: "none", marginBottom: 8 }} 
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button 
            onClick={handleSaveOrUpdate} 
            style={{ flex: 1, padding: "6px", borderRadius: 8, background: "var(--btn-bg)", color: "var(--btn-text)", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
          >
            {editingNoteId ? "Update" : "Save Note"}
          </button>
          {editingNoteId !== null && (
            <button 
              onClick={cancelEdit} 
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--text-muted)" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map(n => {
          const isExpanded = expandedNoteIds.has(n.id);
          return (
            <div 
              key={n.id} 
              onClick={() => toggleExpand(n.id)}
              style={{ 
                background: "var(--bg-card)", 
                padding: 10, 
                borderRadius: 8, 
                border: isExpanded ? "1.5px solid var(--text-main)" : "1px solid var(--border)", 
                boxShadow: isExpanded ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: "var(--text-main)" }}>
                {n.pinned && <span style={{ marginRight: 4 }}>📌</span>}
                {n.title || "Quick Note"}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>
                {n.category || "General"}
              </div>
              <div style={{ 
                fontSize: 11, 
                lineHeight: 1.4, 
                color: "var(--text-muted)", 
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                ...(isExpanded ? {} : {
                  overflow: "hidden", 
                  display: "-webkit-box", 
                  WebKitLineClamp: 2, 
                  WebKitBoxOrient: "vertical"
                })
              }}>
                {n.text || "Empty note"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{new Date(n.time || Date.now()).toLocaleDateString()}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span 
                    onClick={(e) => startEdit(n, e)} 
                    style={{ cursor: "pointer", color: "#3b82f6", fontWeight: 700 }}
                  >
                    Edit
                  </span>
                  <span 
                    onClick={(e) => handleDelete(n.id, e)} 
                    style={{ cursor: "pointer", color: "var(--danger-text)", fontWeight: 700 }}
                  >
                    Delete
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
