import React, { useState, useEffect, useRef } from "react";
import { getTodayKey, CATEGORY_COLORS, NOTE_CATEGORIES, inpStyle } from "../utils";
import { API_URL as API } from "../constants";
import { Card, CheckBox, MarkdownRenderer } from "./SharedComponents";
import BookNoteView from "./BookNoteView";
import SearchResultsView from "./SearchResultsView";

export default function NotesView({ data, onUpdate, selectedId, setSelectedId }) {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSearchResults, setViewingSearchResults] = useState(false);
  const [selectedBookChapterId, setSelectedBookChapterId] = useState(null);
  const [selectedBookPageId, setSelectedBookPageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("System Design");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${API}/upload`, {
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

  const journalText = data.journal || "";
  const pinnedText = data.pinnedNote || "";

  // Initialize edit fields
  useEffect(() => {
    if (selectedId === "journal") {
      setEditText(data.journal || "");
      setEditTitle("Study Journal");
      setEditCategory("General");
    } else if (selectedId && !selectedId.toString().startsWith("daily-")) {
      const note = (data.generalNotes || []).find(n => n.id === selectedId);
      if (note) {
        setEditTitle(note.title || "");
        setEditText(note.text || "");
        setEditCategory(note.category || "System Design");
      }
    }
    setIsEditing(false);
  }, [selectedId, data.generalNotes, data.journal]);

  // Handle Save
  const handleSave = () => {
    if (selectedId === "journal") {
      onUpdate({ ...data, journal: editText });
      setIsEditing(false);
    } else {
      const updatedNotes = (data.generalNotes || []).map(n => {
        if (n.id === selectedId) {
          return {
            ...n,
            title: editTitle.trim() || "Untitled Note",
            text: editText,
            category: editCategory,
            time: new Date().toISOString()
          };
        }
        return n;
      });
      onUpdate({ ...data, generalNotes: updatedNotes });
      setIsEditing(false);
    }
  };

  // Handle Pinned Text Save
  const handleSavePinned = (text) => {
    onUpdate({ ...data, pinnedNote: text });
  };

  // Handle Pin Toggle for Custom Note
  const handleTogglePin = () => {
    const updatedNotes = (data.generalNotes || []).map(n => {
      if (n.id === selectedId) {
        return { ...n, pinned: !n.pinned };
      }
      return n;
    });
    onUpdate({ ...data, generalNotes: updatedNotes });
  };

  // Handle Delete Note
  const handleDeleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const updatedNotes = (data.generalNotes || []).filter(n => n.id !== noteId);
      onUpdate({ ...data, generalNotes: updatedNotes });
      setSelectedId(updatedNotes.length > 0 ? updatedNotes[0].id : "journal");
      setIsEditing(false);
    }
  };

  const handleCreateNote = () => {
    const defaultCat = activeCategory !== "All Categories" && activeCategory !== "Daily Logs" ? activeCategory : "System Design";
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      text: "",
      category: defaultCat,
      time: new Date().toISOString(),
      pinned: false
    };
    const updatedNotes = [newNote, ...(data.generalNotes || [])];
    onUpdate({ ...data, generalNotes: updatedNotes });
    setSelectedId(newNote.id);
    setSelectedBookChapterId(null);
    setSelectedBookPageId(null);
    setViewingSearchResults(false);
    setIsEditing(true);
  };

  const handleCreateBook = () => {
    const defaultCat = activeCategory !== "All Categories" && activeCategory !== "Daily Logs" ? activeCategory : "System Design";
    const newBook = {
      id: Date.now(),
      title: "Untitled Book",
      type: "book",
      category: defaultCat,
      time: new Date().toISOString(),
      pinned: false,
      chapters: []
    };
    const updatedNotes = [newBook, ...(data.generalNotes || [])];
    onUpdate({ ...data, generalNotes: updatedNotes });
    setSelectedId(newBook.id);
    setSelectedBookChapterId(null);
    setSelectedBookPageId(null);
    setViewingSearchResults(false);
    setIsEditing(false);
  };

  // Filtering Notes
  const filteredGeneralNotes = (data.generalNotes || []).filter(note => {
    const matchesCategory = activeCategory === "All Categories" || note.category === activeCategory;
    const matchesSearch = searchQuery.trim() === "" || 
      (note.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (note.text || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.time || 0) - new Date(a.time || 0);
  });

  const dailyLogsEntries = Object.entries(data.dailyNotes || {})
    .filter(([dateKey, notes]) => {
      if (activeCategory !== "Daily Logs") return false;
      const notesText = notes.map(n => n.text).join(" ");
      const matchesSearch = searchQuery.trim() === "" || 
        dateKey.includes(searchQuery) || 
        notesText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => b[0].localeCompare(a[0]));

  const showJournalInList = activeCategory === "Daily Logs" && 
    (searchQuery.trim() === "" || journalText.toLowerCase().includes(searchQuery.toLowerCase()));

  // Selected note details
  let selectedNote = null;
  let isDailyLog = false;
  let dailyLogData = null;

  if (selectedId === "journal") {
    selectedNote = {
      title: "Study Journal",
      text: journalText,
      category: "General",
      time: new Date().toISOString()
    };
  } else if (selectedId && selectedId.toString().startsWith("daily-")) {
    isDailyLog = true;
    const dateKey = selectedId.replace("daily-", "");
    dailyLogData = {
      date: dateKey,
      notes: data.dailyNotes?.[dateKey] || [],
      plan: data.dailyPlanning?.[dateKey] || []
    };
  } else {
    selectedNote = (data.generalNotes || []).find(n => n.id === selectedId);
  }

  // Calculate note counts per category
  const getCategoryCount = (cat) => {
    if (cat === "All Categories") return (data.generalNotes || []).length;
    if (cat === "Daily Logs") return Object.keys(data.dailyNotes || {}).length + (journalText.trim() ? 1 : 0);
    return (data.generalNotes || []).filter(n => n.category === cat).length;
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "All Categories": return "📁";
      case "System Design": return "💡";
      case "Microservices": return "⚙️";
      case "Design Patterns": return "🧱";
      case "Core CS & DSA": return "💻";
      case "General": return "📓";
      case "JAVA": return "☕";
      case "Messaging & Cache": return "💬";
      case "Daily Logs": return "📅";
      default: return "📄";
    }
  };

  return (
    <div>
      {/* Pinned thought box (top level container) */}
      <Card style={{ marginBottom: 18, borderLeft: "3px solid var(--warning-text)", borderRadius: "0 12px 12px 0", background: "var(--bg-card)", padding: "14px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#854F0B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span>📌 Pinned board</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>(Auto-saves)</span>
        </div>
        <textarea 
          value={pinnedText} 
          onChange={e => handleSavePinned(e.target.value)} 
          placeholder="Pin important thoughts, reminders, formulas, or a goal for the week..." 
          style={{ width: "100%", minHeight: 45, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--text-main)", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} 
        />
      </Card>
      <div style={isExpanded ? {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        display: "flex", background: "var(--bg-card)", overflow: "hidden"
      } : {
        display: "flex", gap: 20, height: "calc(100vh - 220px)", minHeight: 520, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
      }}>
        
        {/* Left Pane - Sidebar */}
        {!isExpanded && (
        <div style={{ width: 280, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--bg-sidebar)" }}>
          
          {/* Sidebar Header: Categories list */}
          <div style={{ padding: "12px 12px 6px 12px", borderBottom: "1px solid var(--border)", position: "relative" }}>
            <input 
              value={searchQuery}
              onChange={e => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() !== "") {
                  setViewingSearchResults(true);
                } else {
                  setViewingSearchResults(false);
                }
              }}
              placeholder="Search notes & logs..."
              style={{ ...inpStyle, fontSize: 12, padding: "6px 28px 6px 10px", borderRadius: 6, background: "var(--bg-card)", width: "100%", boxSizing: "border-box" }}
            />
            {searchQuery && (
              <span 
                onClick={() => {
                  setSearchQuery("");
                  setViewingSearchResults(false);
                }}
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: 14,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                ✕
              </span>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ padding: "8px 8px 4px 8px", display: "flex", flexDirection: "column", gap: 2, borderBottom: "1px solid var(--border)" }}>
            {NOTE_CATEGORIES.map(cat => {
              const active = activeCategory === cat;
              return (
                <div 
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSearchQuery("");
                    setViewingSearchResults(false);
                  }}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: "6px 8px", 
                    borderRadius: 6, 
                    cursor: "pointer", 
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    background: active ? "#eef2f6" : "transparent",
                    color: active ? "#1e293b" : "#64748b",
                    transition: "all 0.15s"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{getCategoryIcon(cat)}</span>
                    <span>{cat}</span>
                  </span>
                  <span style={{ fontSize: 10, background: active ? "var(--bg-card)" : "var(--border)", padding: "1px 6px", borderRadius: 10, color: "var(--text-muted)" }}>
                    {getCategoryCount(cat)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Notes List inside Sidebar */}
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {activeCategory === "Daily Logs" ? (
              <>
                {showJournalInList && (
                  <div 
                    onClick={() => {
                      setSelectedId("journal");
                      setSelectedBookChapterId(null);
                      setSelectedBookPageId(null);
                      setViewingSearchResults(false);
                    }}
                    style={{
                      background: selectedId === "journal" ? "var(--bg-card)" : "transparent",
                      border: selectedId === "journal" ? "1px solid var(--border)" : "1px solid transparent",
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginBottom: 4,
                      boxShadow: selectedId === "journal" ? "0 2px 8px rgba(0,0,0,0.03)" : "none"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span>📓</span> Study Journal
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {journalText.substring(0, 45) || "Your ongoing study entries..."}
                    </div>
                  </div>
                )}
                {dailyLogsEntries.map(([dateKey, notes]) => {
                  const active = selectedId === "daily-" + dateKey;
                  const isToday = dateKey === getTodayKey();
                  return (
                    <div 
                      key={dateKey}
                      onClick={() => {
                        setSelectedId("daily-" + dateKey);
                        setSelectedBookChapterId(null);
                        setSelectedBookPageId(null);
                        setViewingSearchResults(false);
                      }}
                      style={{
                        background: active ? "var(--bg-card)" : "transparent",
                        border: active ? "1px solid var(--border)" : "1px solid transparent",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 4,
                        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.03)" : "none"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-main)", display: "flex", justifyContent: "space-between" }}>
                        <span>📅 {dateKey}</span>
                        {isToday && <span style={{ fontSize: 9, background: "var(--badge-cloud-bg)", color: "var(--badge-cloud-text)", padding: "1px 4px", borderRadius: 4 }}>Today</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {notes.length} log entries / {notes.map(n => n.text).join(", ").substring(0, 30)}
                      </div>
                    </div>
                  );
                })}
                {dailyLogsEntries.length === 0 && !showJournalInList && (
                  <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 24, fontStyle: "italic" }}>
                    No logs found.
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredGeneralNotes.map(note => {
                  const active = selectedId === note.id;
                  const colors = CATEGORY_COLORS[note.category] || CATEGORY_COLORS["General"];
                  return (
                    <div 
                      key={note.id}
                      onClick={() => {
                        setSelectedId(note.id);
                        setSelectedBookChapterId(null);
                        setSelectedBookPageId(null);
                        setViewingSearchResults(false);
                      }}
                      style={{
                        background: active ? "var(--bg-card)" : "transparent",
                        border: active ? "1px solid var(--border)" : "1px solid transparent",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 6,
                        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-main)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical", whiteSpace: "normal" }}>
                          {note.pinned && <span style={{ marginRight: 4 }}>📌</span>}
                          {note.title || "Untitled Note"}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical", whiteSpace: "normal", lineHeight: 1.4 }}>
                        {note.text ? note.text.replace(/#+ /g, "").substring(0, 90) : "No content."}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 9, color: "#94a3b8" }}>{new Date(note.time).toLocaleDateString()}</span>
                        <span style={{ fontSize: 9, color: colors.text, background: colors.bg, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                          {note.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredGeneralNotes.length === 0 && (
                  <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 24, fontStyle: "italic" }}>
                    No notes found.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Footer: Add button */}
          {activeCategory !== "Daily Logs" && (
            <div style={{ padding: 12, borderTop: "1px solid var(--border)", background: "var(--bg-sidebar)", display: "flex", gap: 8 }}>
              <button 
                onClick={handleCreateNote}
                style={{ 
                  flex: 1, 
                  padding: "8px", 
                  borderRadius: 8, 
                  background: "var(--btn-bg)", 
                  color: "var(--btn-text)", 
                  border: "none", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 6,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                }}
              >
                <span>➕</span> Note
              </button>
              <button 
                onClick={handleCreateBook}
                style={{ 
                  flex: 1, 
                  padding: "8px", 
                  borderRadius: 8, 
                  background: "var(--btn-bg)", 
                  color: "var(--btn-text)", 
                  border: "none", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 6,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                }}
              >
                <span>📘</span> Book
              </button>
            </div>
          )}
        </div>
        )}

        {/* Right Pane - Workspace */}
        {viewingSearchResults ? (
          <SearchResultsView 
            data={data}
            searchQuery={searchQuery}
            onSelectResult={(result) => {
              setSelectedId(result.id);
              if (result.type === "book-page") {
                setSelectedBookChapterId(result.chapterId);
                setSelectedBookPageId(result.pageId);
              } else {
                setSelectedBookChapterId(null);
                setSelectedBookPageId(null);
              }
              setViewingSearchResults(false);
            }}
            onClearSearch={() => {
              setSearchQuery("");
              setViewingSearchResults(false);
            }}
          />
        ) : selectedNote && selectedNote.type === "book" ? (
          <BookNoteView 
            note={selectedNote} 
            onUpdate={(updatedNote) => {
              const updatedNotes = (data.generalNotes || []).map(n => n.id === updatedNote.id ? updatedNote : n);
              onUpdate({ ...data, generalNotes: updatedNotes });
            }}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            onDelete={() => handleDeleteNote(selectedNote.id)}
            initialChapterId={selectedBookChapterId}
            initialPageId={selectedBookPageId}
            showBackToSearch={searchQuery.trim() !== ""}
            onBackToSearch={() => setViewingSearchResults(true)}
          />
        ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-card)" }}>
          
          {/* Note View Header / Toolbar */}
          {selectedNote || isDailyLog ? (
            <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-sidebar)", flexShrink: 0 }}>
              
              {/* Left Side Metadata */}
              <div>
                {isDailyLog ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>📅 Logs: {dailyLogData.date}</span>
                    <span style={{ fontSize: 9, background: "#d1fae5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Daily Log</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {selectedId !== "journal" && (
                        <span 
                          onClick={handleTogglePin}
                          style={{ cursor: "pointer", fontSize: 16 }} 
                          title={selectedNote.pinned ? "Unpin note" : "Pin note"}
                        >
                          {selectedNote.pinned ? "📌" : "📍"}
                        </span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
                        {selectedId === "journal" ? "Study Journal" : selectedNote.title || "Untitled"}
                      </span>
                    </div>
                    {selectedId !== "journal" && (
                      <span style={{ fontSize: 9, color: CATEGORY_COLORS[selectedNote.category]?.text, background: CATEGORY_COLORS[selectedNote.category]?.bg, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {selectedNote.category}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {searchQuery.trim() !== "" && (
                  <button 
                    onClick={() => setViewingSearchResults(true)}
                    style={{
                      background: "var(--badge-cloud-bg, #eef2f6)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--badge-cloud-text, #1e293b)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    🔍 Back to Search
                  </button>
                )}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "4px 10px",
                  }}
                  title={isExpanded ? "Restore view" : "Expand to full page"}
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </button>
                {!isDailyLog && (
                  <>
                    <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", background: "var(--bg-card)" }}>
                      <button 
                        onClick={() => setIsEditing(false)} 
                        style={{ 
                          padding: "3px 10px", 
                          fontSize: 11, 
                          fontWeight: 700,
                          border: "none", 
                          background: !isEditing ? "#1e293b" : "transparent", 
                          color: !isEditing ? "var(--bg-card)" : "var(--text-muted)", 
                          cursor: "pointer" 
                        }}
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        style={{ 
                          padding: "3px 10px", 
                          fontSize: 11, 
                          fontWeight: 700,
                          border: "none", 
                          background: isEditing ? "#1e293b" : "transparent", 
                          color: isEditing ? "var(--bg-card)" : "var(--text-muted)", 
                          cursor: "pointer" 
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {selectedId !== "journal" && (
                      <button 
                        onClick={() => handleDeleteNote(selectedId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--danger-text)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: 4
                        }}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          ) : null}

          {/* Note Content / Scrollable workspace */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, boxSizing: "border-box" }}>
            {isDailyLog ? (
              <div style={{ maxWidth: "100%" }}>
                <h3 style={{ marginTop: 0, fontSize: 16, borderBottom: "2px solid var(--border)", paddingBottom: 8 }}>📝 Logs & Notes</h3>
                {dailyLogData.notes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No log entries recorded for this day.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {dailyLogData.notes.map(n => (
                      <div key={n.id} style={{ background: "var(--bg-sidebar)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                          {n.time === "Migrated" ? "Legacy Note" : new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ fontSize: 16, borderBottom: "2px solid var(--border)", paddingBottom: 8, marginTop: 24 }}>🎯 Plan vs Reality Checklist</h3>
                {dailyLogData.plan.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No planning checklist targets set for this day.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dailyLogData.plan.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: p.achieved ? "var(--success-bg)" : "var(--bg-card)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <CheckBox done={p.achieved} size={16} />
                        <span style={{ fontSize: 13, textDecoration: p.achieved ? "line-through" : "none", color: p.achieved ? "var(--success-text)" : "var(--text-muted)" }}>
                          {p.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedNote ? (
              isEditing ? (
                // Edit view
                <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", maxWidth: "100%" }}>
                  
                  {selectedId !== "journal" && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Note Title</label>
                        <input 
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          placeholder="Note Title (e.g., Saga Pattern in Microservices)"
                          style={{ ...inpStyle, fontSize: 14, fontWeight: 700, padding: "8px 12px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Category</label>
                        <select 
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          style={{ ...inpStyle, height: 37, fontSize: 12, padding: "4px 8px", width: 160 }}
                        >
                          {NOTE_CATEGORIES.filter(c => c !== "All Categories" && c !== "Daily Logs").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
                        Content (Markdown Supported)
                      </label>
                      <label style={{ 
                        fontSize: 11, fontWeight: 700, color: "var(--text-muted)", 
                        cursor: "pointer", background: "var(--bg-card-hover)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4
                      }}>
                        <span>{isUploading ? "⏳ Uploading..." : "🖼️ Insert Image"}</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={isUploading} />
                      </label>
                    </div>
                    <textarea 
                      ref={textareaRef}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      placeholder={selectedId === "journal" 
                        ? "Write down concepts, questions to revisit, reflections..." 
                        : "# Core Design Idea\nWrite notes using markdown tags like # Header, **bold**, *italics*, `code`, lists, tables, and ```code blocks```."
                      }
                      style={{ 
                        width: "100%", 
                        flex: 1, 
                        minHeight: 280, 
                        border: "1px solid var(--border)", 
                        borderRadius: 8, 
                        padding: 16, 
                        fontSize: 13, 
                        fontFamily: "monospace", 
                        lineHeight: 1.6, 
                        outline: "none", 
                        boxSizing: "border-box", 
                        resize: "vertical" 
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button 
                      onClick={handleSave}
                      style={{ padding: "8px 20px", borderRadius: 6, background: "var(--btn-bg)", color: "var(--btn-text)", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>
                      💡 Format: # Header  **bold**  - list  `code`  | table |
                    </span>
                  </div>

                </div>
              ) : (
                // Rendered Preview view
                <div style={{ maxWidth: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--bg-card-hover)", paddingBottom: 10 }}>
                    <h1 style={{ margin: 0, fontSize: "1.8em", fontWeight: 800, color: "var(--text-main)" }}>
                      {selectedId === "journal" ? "Study Journal" : selectedNote.title || "Untitled Note"}
                    </h1>
                  </div>
                  
                  {selectedId !== "journal" && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, fontSize: 12, color: "var(--text-muted)" }}>
                      <span style={{ background: CATEGORY_COLORS[selectedNote.category]?.bg, color: CATEGORY_COLORS[selectedNote.category]?.text, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                        {selectedNote.category}
                      </span>
                      <span>•</span>
                      <span>Modified: {new Date(selectedNote.time).toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ paddingBottom: 40 }}>
                    <MarkdownRenderer text={selectedNote.text} />
                  </div>
                </div>
              )
            ) : (
              // Empty State
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", textAlign: "center" }}>
                <span style={{ fontSize: 48, marginBottom: 12 }}>📚</span>
                <h3 style={{ margin: 0, color: "var(--text-muted)" }}>Knowledge Hub</h3>
                <p style={{ fontSize: 13, maxWidth: 300, margin: "8px 0 0 0", lineHeight: 1.5 }}>
                  Select a note from the left sidebar to read or edit, or create a new markdown note.
                </p>
              </div>
            )}
          </div>

        </div>
        )}

      </div>
    </div>
  );
}

// ─── MIGRATION HELPER ──────────────────────────────────────────
export function migrateLegacyNotes(notes) {
  let updated = false;
  if (!notes || !Array.isArray(notes)) return { migrated: [], updated: false };
  const migrated = notes.map(note => {
    let needsUpdate = false;
    const newNote = { ...note };
    
    // Add title if missing
    if (!newNote.title) {
      needsUpdate = true;
      const lines = (newNote.text || "").split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const firstLine = lines[0].replace(/^#+[ ]+/, "");
        newNote.title = firstLine.substring(0, 80);
      } else {
        newNote.title = "Untitled Note";
      }
    }
    
    // Add category if missing
    if (!newNote.category) {
      needsUpdate = true;
      const lowerText = (newNote.text || "").toLowerCase();
      if (lowerText.includes("microservice") || lowerText.includes("decomposition") || lowerText.includes("saga") || lowerText.includes("cqrs") || lowerText.includes("strangler")) {
        newNote.category = "Microservices";
      } else if (lowerText.includes("kafka") || lowerText.includes("rabbitmq") || lowerText.includes("message") || lowerText.includes("queue") || lowerText.includes("cache") || lowerText.includes("redis") || lowerText.includes("pub/sub") || lowerText.includes("memcached")) {
        newNote.category = "Messaging & Cache";
      } else if (lowerText.includes("system design") || lowerText.includes("distributed") || lowerText.includes("database") || lowerText.includes("scaling") || lowerText.includes("load balancing")) {
        newNote.category = "System Design";
      } else if (lowerText.includes("pattern") || lowerText.includes("singleton") || lowerText.includes("factory") || lowerText.includes("observer")) {
        newNote.category = "Design Patterns";
      } else if (lowerText.includes("dsa") || lowerText.includes("array") || lowerText.includes("tree") || lowerText.includes("graph") || lowerText.includes("algorithm")) {
        newNote.category = "Core CS & DSA";
      } else {
        newNote.category = "General";
      }
    }

    if (needsUpdate) {
      updated = true;
    }
    return newNote;
  });

  return { migrated, updated };
}
