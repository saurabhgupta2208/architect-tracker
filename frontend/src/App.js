import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  getTodayKey, 
  getDayNumber, 
  calcStreak, 
  SIX_MONTH_PLAN, 
  DEFAULT_TASKS, 
  VIEWS,
  apiGet, 
  apiPut,
  formatFullDate
} from "./utils";
import { SettingsModal, GeneralNotesSidebar, DailyNotesSection, DailyPlanSection } from "./components/SharedComponents";
import TodayView from "./components/TodayView";
import ScheduleView from "./components/ScheduleView";
import PlanView from "./components/PlanView";
import SkillsView from "./components/SkillsView";
import HistoryView from "./components/HistoryView";
import TasksView from "./components/TasksView";
import NotesView, { migrateLegacyNotes } from "./components/NotesView";

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("today");
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem("sidebarOpen") !== "false");
  const saveTimer = useRef(null);

  const [selectedNoteId, setSelectedNoteId] = useState("journal");
  const [migrationDone, setMigrationDone] = useState(false);

  useEffect(() => {
    apiGet("/data").then(d => { if (d) setData(d); });
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen);
  }, [sidebarOpen]);

  const persistData = useCallback((newData) => {
    setData(newData);
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await apiPut("/data", newData);
      setSaving(false);
    }, 700);
  }, []);

  // Theme Management
  useEffect(() => {
    if (data && data.settings) {
      const theme = data.settings.theme || 'dark';
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    } else {
      document.body.classList.add('dark-theme'); // default to dark
    }
  }, [data]);

  // Safe migration of existing/legacy notes on load
  useEffect(() => {
    if (data && data.generalNotes && !migrationDone) {
      const { migrated, updated } = migrateLegacyNotes(data.generalNotes);
      if (updated) {
        const updatedData = { ...data, generalNotes: migrated };
        setData(updatedData);
        apiPut("/data", updatedData);
      }
      setMigrationDone(true);
    }
  }, [data, migrationDone]);

  const handleSelectNote = (id) => {
    setView("notes");
    setSelectedNoteId(id);
  };

  const updateSettings = (settings) => persistData({ ...data, settings: { ...data.settings, ...settings } });
  const updateQuickNotes = (notes) => persistData({ ...data, quickNotes: notes });
  const updateGeneralNotes = (notes) => persistData({ ...data, generalNotes: notes });
  const updateDailyNotes = (date, notes) => persistData({ ...data, dailyNotes: { ...data.dailyNotes, [date]: notes } });
  const updateDailyPlanning = (date, planning) => persistData({ ...data, dailyPlanning: { ...data.dailyPlanning, [date]: planning } });

  if (!data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 14, color: "var(--text-muted)" }}>Loading…</div>;

  const { totalDays, startDate } = data.settings;
  const dayNumber = getDayNumber(startDate);
  const allTasks = [...DEFAULT_TASKS, ...(data.customTasks || [])];
  const streak = calcStreak(data.days || {});
  const todayKey = getTodayKey();
  const todayData = data.days?.[todayKey] || { tasks: {}, checklist: {} };
  const todayDone = Object.values(todayData.tasks || {}).filter(Boolean).length;
  const planDone = (data.sixMonthPlan || SIX_MONTH_PLAN).filter(m => Array.isArray(m.weeks)).reduce((a, m) => a + m.weeks.reduce((b, w) => b + w.tasks.filter(t => t.done).length, 0), 0);
  const planTotal = (data.sixMonthPlan || SIX_MONTH_PLAN).filter(m => Array.isArray(m.weeks)).reduce((a, m) => a + m.weeks.reduce((b, w) => b + w.tasks.length, 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)", color: "var(--text-main)" }}>
      {showSettings && <SettingsModal data={data} onSave={(s) => { updateSettings(s); setShowSettings(false); }} onClose={() => setShowSettings(false)} />}

      {sidebarOpen && (
        <GeneralNotesSidebar 
          data={data.quickNotes || []} 
          onUpdate={updateQuickNotes} 
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "10px 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Toggle Sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--bg-card)" strokeWidth="2.2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" }}>Architect Tracker</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Day {dayNumber}/{totalDays} · {streak > 0 ? `🔥 ${streak} streak` : "Build your streak"} {saving ? "· saving…" : ""}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {VIEWS.map(v => (
                  <button key={v.id} onClick={() => setView(v.id)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: view === v.id ? "1px solid var(--text-main)" : "1px solid var(--border)", background: view === v.id ? "var(--text-main)" : "transparent", color: view === v.id ? "var(--bg-card)" : "var(--text-main)", cursor: "pointer", fontWeight: view === v.id ? 700 : 400 }}>{v.label}</button>
                ))}
              </nav>
              <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Global stats bar */}
        <div style={{ maxWidth: 1425, margin: "0 auto", padding: "16px 16px 0", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 18 }}>
            {[
              { val: `Day ${dayNumber}`, lbl: formatFullDate(todayKey) },
              { val: streak, lbl: streak === 1 ? "day streak" : "day streak" },
              { val: `${todayDone}/${allTasks.length}`, lbl: "today done" },
              { val: `${planDone}/${planTotal}`, lbl: "plan tasks" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: view === "notes" ? 1500 : 1425, margin: "0 auto", padding: view === "notes" ? "0 16px 24px" : "0 16px 48px", width: "100%", boxSizing: "border-box", transition: "max-width 0.2s" }}>
          {view === "today" && (
            <>
              <TodayView data={data} allTasks={allTasks} onUpdate={persistData} />
              <DailyPlanSection plan={data.dailyPlanning?.[todayKey] || []} onUpdate={(p) => updateDailyPlanning(todayKey, p)} />
              <DailyNotesSection notes={data.dailyNotes?.[todayKey] || []} onUpdate={(n) => updateDailyNotes(todayKey, n)} />
            </>
          )}
          {view === "schedule" && <ScheduleView data={data} onUpdatePlanning={updateDailyPlanning} />}
          {view === "plan" && <PlanView data={data} onUpdate={persistData} />}
          {view === "skills" && <SkillsView skills={data.skills || []} onSave={s => persistData({ ...data, skills: s })} />}
          {view === "history" && <HistoryView data={data} allTasks={allTasks} />}
          {view === "tasks" && <TasksView customTasks={data.customTasks || []} onSave={ct => persistData({ ...data, customTasks: ct })} onReset={() => persistData({ ...data, days: {}, dailyNotes: {}, dailyPlanning: {}, startDate: getTodayKey() })} />}
          {view === "notes" && (
            <NotesView 
              data={data} 
              onUpdate={persistData} 
              selectedId={selectedNoteId} 
              setSelectedId={setSelectedNoteId} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
