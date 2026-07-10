import React, { useState, useRef } from "react";
import { MarkdownRenderer, CATEGORY_COLORS, NOTE_CATEGORIES, inpStyle } from "../App";
import { API_URL } from "../constants";

export default function BookNoteView({ note, onUpdate, isExpanded, setIsExpanded, onDelete }) {
  const [activeChapterId, setActiveChapterId] = useState(note.chapters?.[0]?.id || null);
  const [activePageId, setActivePageId] = useState(note.chapters?.[0]?.pages?.[0]?.id || null);
  
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState(note.title);
  const [metaCategory, setMetaCategory] = useState(note.category);

  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");

  const textareaRef = useRef(null);

  const activeChapter = note.chapters?.find(c => c.id === activeChapterId);
  const activePage = activeChapter?.pages?.find(p => p.id === activePageId);

  // Initialize edit fields when page changes
  React.useEffect(() => {
    if (activePage) {
      setEditTitle(activePage.title || "");
      setEditText(activePage.text || "");
      setIsEditingPage(false);
    }
  }, [activePageId, activeChapterId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result })
        });
        const resData = await response.json();
        
        if (resData.url) {
          const imgMarkdown = `\n![Image](${resData.url})\n`;
          const ta = textareaRef.current;
          if (ta) {
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newText = editText.substring(0, start) + imgMarkdown + editText.substring(end);
            setEditText(newText);
            setTimeout(() => {
              ta.selectionStart = ta.selectionEnd = start + imgMarkdown.length;
              ta.focus();
            }, 0);
          } else {
            setEditText(prev => prev + imgMarkdown);
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image");
      } finally {
        setIsUploading(false);
        e.target.value = null;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePage = () => {
    const updatedChapters = note.chapters.map(c => {
      if (c.id === activeChapterId) {
        return {
          ...c,
          pages: c.pages.map(p => {
            if (p.id === activePageId) {
              return { ...p, title: editTitle.trim() || "Untitled Page", text: editText };
            }
            return p;
          })
        };
      }
      return c;
    });

    onUpdate({
      ...note,
      chapters: updatedChapters,
      time: new Date().toISOString()
    });
    setIsEditingPage(false);
  };

  const handleSaveMeta = () => {
    onUpdate({
      ...note,
      title: metaTitle.trim() || "Untitled Book",
      category: metaCategory,
      time: new Date().toISOString()
    });
    setIsEditingMeta(false);
  };

  const handleAddChapter = () => {
    const title = window.prompt("Enter chapter title:");
    if (title === null) return; // User cancelled
    
    const newChapter = {
      id: "c_" + Date.now(),
      title: title.trim() || "Untitled Chapter",
      pages: []
    };
    onUpdate({
      ...note,
      chapters: [...(note.chapters || []), newChapter],
      time: new Date().toISOString()
    });
    setActiveChapterId(newChapter.id);
    setActivePageId(null);
  };

  const handleAddPage = (chapterId) => {
    const newPage = {
      id: "p_" + Date.now(),
      title: "New Page",
      text: ""
    };
    const updatedChapters = note.chapters.map(c => {
      if (c.id === chapterId) {
        return { ...c, pages: [...(c.pages || []), newPage] };
      }
      return c;
    });
    onUpdate({
      ...note,
      chapters: updatedChapters,
      time: new Date().toISOString()
    });
    setActiveChapterId(chapterId);
    setActivePageId(newPage.id);
    setIsEditingPage(true);
    setEditTitle(newPage.title);
    setEditText(newPage.text);
  };

  const handleSaveChapter = (chapterId) => {
    const updatedChapters = note.chapters.map(c => {
      if (c.id === chapterId) {
        return { ...c, title: editChapterTitle.trim() || "Untitled Chapter" };
      }
      return c;
    });
    onUpdate({
      ...note,
      chapters: updatedChapters,
      time: new Date().toISOString()
    });
    setEditingChapterId(null);
  };

  const handleTogglePin = () => {
    onUpdate({ ...note, pinned: !note.pinned });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header toolbar */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #E8E6E0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAF9F6", flexShrink: 0 }}>
        <div>
          {isEditingMeta ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input 
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                style={{ ...inpStyle, width: 250 }}
              />
              <select 
                value={metaCategory}
                onChange={e => setMetaCategory(e.target.value)}
                style={{ ...inpStyle, width: 160 }}
              >
                {NOTE_CATEGORIES.filter(c => c !== "All Categories" && c !== "Daily Logs").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={handleSaveMeta} style={{ padding: "4px 10px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Save</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span onClick={handleTogglePin} style={{ cursor: "pointer", fontSize: 16 }} title={note.pinned ? "Unpin book" : "Pin book"}>
                  {note.pinned ? "📌" : "📍"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  📘 {note.title || "Untitled Book"}
                </span>
                <button onClick={() => setIsEditingMeta(true)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "#64748b" }}>✎</button>
              </div>
              <span style={{ fontSize: 9, color: CATEGORY_COLORS[note.category]?.text, background: CATEGORY_COLORS[note.category]?.bg, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                {note.category}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: 6, color: "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 10px" }}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button 
            onClick={onDelete}
            style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 8px", borderRadius: 4 }}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chapters Sidebar */}
        <div style={{ width: 240, borderRight: "1px solid #E8E6E0", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px", borderBottom: "1px solid #E8E6E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Table of Contents</span>
            <button onClick={handleAddChapter} style={{ background: "transparent", border: "1px solid #cbd5e1", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 11, color: "#1e293b", fontWeight: 700 }}>+ Chapter</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {note.chapters?.map((c, idx) => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {editingChapterId === c.id ? (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flex: 1, marginRight: 8 }}>
                      <input 
                        autoFocus
                        value={editChapterTitle}
                        onChange={e => setEditChapterTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveChapter(c.id);
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingChapterId(null);
                          }
                        }}
                        placeholder="Chapter Title"
                        style={{ ...inpStyle, fontSize: 11, padding: "2px 6px", height: 22 }}
                      />
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveChapter(c.id); }} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 10, padding: "2px 6px" }}>Save</button>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingChapterId(null); }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 10, padding: "2px 6px" }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span 
                        onDoubleClick={() => { setEditingChapterId(c.id); setEditChapterTitle(c.title); }}
                        style={{ cursor: "text" }}
                        title="Double-click to edit"
                      >
                        {idx + 1}. {c.title}
                      </span>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingChapterId(c.id); setEditChapterTitle(c.title); }} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", fontSize: 9, color: "#475569", padding: "2px 6px" }}>Edit</button>
                    </div>
                  )}
                  {editingChapterId !== c.id && (
                    <button onClick={() => handleAddPage(c.id)} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 11 }}>+ Page</button>
                  )}
                </div>
                <div>
                  {c.pages?.map((p, pIdx) => {
                    const isActive = p.id === activePageId;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => { setActiveChapterId(c.id); setActivePageId(p.id); }}
                        style={{
                          padding: "6px 12px 6px 28px",
                          fontSize: 12,
                          cursor: "pointer",
                          background: isActive ? "#e0e7ff" : "transparent",
                          color: isActive ? "#4338ca" : "#475569",
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? "3px solid #4338ca" : "3px solid transparent",
                        }}
                      >
                        📄 {p.title}
                      </div>
                    );
                  })}
                  {(!c.pages || c.pages.length === 0) && (
                    <div style={{ padding: "4px 12px 4px 28px", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>No pages yet.</div>
                  )}
                </div>
              </div>
            ))}
            {(!note.chapters || note.chapters.length === 0) && (
              <div style={{ padding: 12, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>No chapters created.</div>
            )}
          </div>
        </div>

        {/* Page Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", padding: 24, boxSizing: "border-box" }}>
          {!activePage ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", textAlign: "center" }}>
              <span style={{ fontSize: 48, marginBottom: 12 }}>📖</span>
              <h3 style={{ margin: 0, color: "#475569" }}>Select a page</h3>
              <p style={{ fontSize: 13, maxWidth: 300, margin: "8px 0 0 0", lineHeight: 1.5 }}>
                Choose a page from the table of contents or create a new one to start writing.
              </p>
            </div>
          ) : (
            isEditingPage ? (
              // Edit view
              <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", maxWidth: "100%" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Page Title</label>
                  <input 
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Page Title"
                    style={{ ...inpStyle, fontSize: 14, fontWeight: 700, padding: "8px 12px" }}
                  />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                      Content (Markdown Supported)
                    </label>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer", background: "#f1f5f9", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <span>{isUploading ? "⏳ Uploading..." : "🖼️ Insert Image"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <textarea 
                    ref={textareaRef}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    placeholder="Write notes using markdown..."
                    style={{ width: "100%", flex: 1, minHeight: 280, border: "1px solid #cbd5e1", borderRadius: 8, padding: 16, fontSize: 13, fontFamily: "monospace", lineHeight: 1.6, outline: "none", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={handleSavePage} style={{ padding: "8px 20px", borderRadius: 6, background: "#1e293b", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save Page</button>
                  <button onClick={() => setIsEditingPage(false)} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "transparent", fontSize: 12, color: "#475569", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              // Rendered Preview view
              <div style={{ maxWidth: "100%", height: "100%", overflowY: "auto", paddingRight: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                  <h1 style={{ margin: 0, fontSize: "1.8em", fontWeight: 800, color: "#0f172a" }}>
                    {activePage.title || "Untitled Page"}
                  </h1>
                  <button onClick={() => setIsEditingPage(true)} style={{ padding: "4px 12px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>Edit Page</button>
                </div>
                <div style={{ paddingBottom: 40 }}>
                  <MarkdownRenderer text={activePage.text} />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
