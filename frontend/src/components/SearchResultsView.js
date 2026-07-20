import React from "react";
import { CATEGORY_COLORS } from "../utils";

// Global Search Helper across notes, books, daily logs, and study journal
function getSearchResults(data, query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  const getSnippet = (text, queryStr) => {
    if (!text) return null;
    const idx = text.toLowerCase().indexOf(queryStr);
    if (idx === -1) return null;
    
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + queryStr.length + 60);
    
    let prefix = text.substring(start, idx);
    let suffix = text.substring(idx + queryStr.length, end);
    
    if (start > 0) prefix = "..." + prefix;
    if (end < text.length) suffix = suffix + "...";
    
    return {
      before: prefix,
      match: text.substring(idx, idx + queryStr.length),
      after: suffix
    };
  };

  // 1. Search General Notes
  (data.generalNotes || []).forEach(note => {
    const isBook = note.type === "book";
    
    if (isBook) {
      // Check Book Title
      let bookMatch = false;
      if (note.title && note.title.toLowerCase().includes(q)) {
        results.push({
          id: note.id,
          type: "book",
          title: note.title,
          category: note.category,
          pinned: note.pinned,
          matchType: "title",
          displayTitle: note.title,
          snippet: { before: "", match: note.title, after: "" }
        });
        bookMatch = true;
      }
      
      // Check Chapters and Pages
      (note.chapters || []).forEach(chapter => {
        (chapter.pages || []).forEach(page => {
          const pageTitleMatch = page.title && page.title.toLowerCase().includes(q);
          const pageTextSnippet = getSnippet(page.text || "", q);
          
          if (pageTitleMatch || pageTextSnippet) {
            results.push({
              id: note.id,
              type: "book-page",
              bookTitle: note.title,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              pageId: page.id,
              pageTitle: page.title,
              category: note.category,
              pinned: note.pinned,
              matchType: pageTitleMatch ? "page-title" : "page-text",
              displayTitle: `${note.title} > ${chapter.title} > ${page.title}`,
              snippet: pageTextSnippet || { before: "", match: page.title, after: "" }
            });
          }
        });
      });
    } else {
      // Regular Note
      const titleMatch = note.title && note.title.toLowerCase().includes(q);
      const textSnippet = getSnippet(note.text || "", q);
      
      if (titleMatch || textSnippet) {
        results.push({
          id: note.id,
          type: "note",
          title: note.title,
          category: note.category,
          pinned: note.pinned,
          matchType: titleMatch ? "title" : "text",
          displayTitle: note.title || "Untitled Note",
          snippet: textSnippet || { before: "", match: note.title || "Untitled Note", after: "" }
        });
      }
    }
  });

  // 2. Search Daily Logs
  Object.entries(data.dailyNotes || {}).forEach(([dateKey, notes]) => {
    const dateMatch = dateKey.includes(q);
    
    notes.forEach(note => {
      const textSnippet = getSnippet(note.text || "", q);
      if (dateMatch || textSnippet) {
        results.push({
          id: "daily-" + dateKey,
          type: "daily-log",
          date: dateKey,
          category: "Daily Logs",
          matchType: dateMatch ? "date" : "log-text",
          displayTitle: `Daily Log - ${dateKey}`,
          snippet: textSnippet || { before: "", match: dateKey, after: "" }
        });
      }
    });
  });

  // 3. Search Study Journal
  const journalText = data.journal || "";
  const journalSnippet = getSnippet(journalText, q);
  const journalTitleMatch = "study journal".includes(q);
  if (journalSnippet || journalTitleMatch) {
    results.push({
      id: "journal",
      type: "journal",
      category: "General",
      matchType: journalSnippet ? "journal-text" : "title",
      displayTitle: "Study Journal",
      snippet: journalSnippet || { before: "", match: "Study Journal", after: "" }
    });
  }

  return results;
}

export default function SearchResultsView({ data, searchQuery, onSelectResult, onClearSearch }) {
  const results = getSearchResults(data, searchQuery);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-card)" }}>
      {/* Search Results Header */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-sidebar)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
            Search Results for "{searchQuery}"
          </span>
          <span style={{ fontSize: 10, background: "var(--border)", padding: "2px 8px", borderRadius: 10, color: "var(--text-muted)", marginLeft: 6 }}>
            {results.length} matches
          </span>
        </div>
        <button 
          onClick={onClearSearch}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-muted)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            padding: "4px 10px",
          }}
        >
          Clear Search
        </button>
      </div>
      
      {/* Search Results Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, boxSizing: "border-box" }}>
        {results.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", textAlign: "center" }}>
            <span style={{ fontSize: 48, marginBottom: 12 }}>🔍</span>
            <h3 style={{ margin: 0, color: "var(--text-muted)" }}>No matches found</h3>
            <p style={{ fontSize: 13, maxWidth: 300, margin: "8px 0 0 0", lineHeight: 1.5 }}>
              Try searching for different keywords or concepts.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((result, idx) => {
              const colors = CATEGORY_COLORS[result.category] || CATEGORY_COLORS["General"];
              const iconMap = {
                "book": "📘",
                "book-page": "📄",
                "note": "📄",
                "daily-log": "📅",
                "journal": "📓"
              };
              const typeIcon = iconMap[result.type] || "📄";
              
              return (
                <div 
                  key={idx}
                  onClick={() => onSelectResult(result)}
                  style={{
                    background: "var(--bg-sidebar)",
                    border: "1px solid var(--border)",
                    padding: "16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-muted)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, color: "var(--text-main)" }}>
                      <span>{typeIcon}</span>
                      {result.pinned && <span style={{ fontSize: 10 }}>📌</span>}
                      <span>{result.displayTitle}</span>
                    </div>
                    <span style={{ fontSize: 9, color: colors.text, background: colors.bg, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      {result.category}
                    </span>
                  </div>
                  
                  {result.snippet && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, fontFamily: "monospace", background: "var(--bg-app)", padding: "8px 12px", borderRadius: 6, borderLeft: "3px solid #7F77DD" }}>
                      {result.snippet.before}
                      <mark style={{
                        background: "rgba(127, 119, 221, 0.25)",
                        color: "var(--text-main)",
                        padding: "1px 4px",
                        borderRadius: 4,
                        fontWeight: 600,
                        borderBottom: "1.5px solid #7F77DD"
                      }}>
                        {result.snippet.match}
                      </mark>
                      {result.snippet.after}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
