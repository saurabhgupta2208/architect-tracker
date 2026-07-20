import React, { useState } from "react";
import { 
  getDayNumber, 
  getDateKey, 
  getPhaseForDay, 
  getPhaseAwareTasks, 
  getDailyQuote, 
  calcStreak, 
  formatDate, 
  formatFullDate, 
  PHASES, 
  MINDSET_CHECKS 
} from "../utils";
import { Card, CheckBox, PBar, SLabel } from "./SharedComponents";

const navBtn = { 
  fontSize: 14, 
  padding: "2px 8px", 
  borderRadius: 6, 
  border: "1px solid var(--border)", 
  background: "transparent", 
  cursor: "pointer", 
  color: "var(--text-main)", 
  lineHeight: 1.4 
};

export default function TodayView({ data, onUpdate }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const { totalDays, startDate } = data.settings;
  const dayNumber = getDayNumber(startDate);
  const viewDay = selectedDay !== null ? selectedDay : Math.min(dayNumber, totalDays);
  const viewKey = getDateKey(startDate, viewDay);
  const isToday = viewDay === Math.min(dayNumber, totalDays) && selectedDay === null;

  const ph = getPhaseForDay(viewDay, totalDays);
  const ps = PHASES[ph];
  const dayData = data.days?.[viewKey] || { tasks: {}, checklist: {} };
  const phaseTasks = getPhaseAwareTasks(viewDay, ph);
  const allCurTasks = [...phaseTasks, ...(data.customTasks || [])];
  const doneTasks = Object.values(dayData.tasks || {}).filter(Boolean).length;
  const doneChecks = Object.values(dayData.checklist || {}).filter(Boolean).length;
  const quote = getDailyQuote();

  const currentWeek = Math.ceil(dayNumber / 7);
  const startWeek = Math.max(1, currentWeek - 1 + weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = (startWeek - 1) * 7 + i + 1;
    return (d >= 1 && d <= totalDays) ? d : null;
  });

  function toggleTask(id) {
    const existing = data.days?.[viewKey] || { tasks: {}, checklist: {} };
    onUpdate({ ...data, days: { ...data.days, [viewKey]: { ...existing, tasks: { ...existing.tasks, [id]: !existing.tasks?.[id] } } } });
  }

  function toggleCheck(id) {
    const existing = data.days?.[viewKey] || { tasks: {}, checklist: {} };
    onUpdate({ ...data, days: { ...data.days, [viewKey]: { ...existing, checklist: { ...existing.checklist, [id]: !existing.checklist?.[id] } } } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Motivational quote */}
      <div style={{ background: ps.bg, border: `1px solid ${ps.color}30`, borderRadius: 12, padding: "14px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ps.text, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
          {ph} Phase · {ps.days} · Day {viewDay}/{totalDays} · {formatFullDate(viewKey)}
        </div>
        <div style={{ fontSize: 14, fontStyle: "italic", color: ps.text, lineHeight: 1.6, marginBottom: 4 }}>"{quote.q}"</div>
        <div style={{ fontSize: 11, color: ps.text, opacity: .7 }}>— {quote.a}</div>
      </div>

      {/* Calendar grid */}
      <Card style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>Progress Calendar</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setWeekOffset(w => Math.max(-currentWeek + 1, w - 1))} style={navBtn}>‹</button>
            <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 4px", alignSelf: "center" }}>Week {startWeek}</span>
            <button onClick={() => setWeekOffset(w => Math.min(Math.ceil(totalDays / 7) - startWeek + 1, w + 1))} style={navBtn}>›</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", fontWeight: 700 }}>{d}</div>)}
          {weekDays.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = getDateKey(startDate, d);
            const dD = data.days?.[key];
            const dDone = dD ? Object.values(dD.tasks || {}).filter(Boolean).length : 0;
            const isSelected = d === viewDay;
            const isTodayDay = d === dayNumber;
            const isFuture = d > dayNumber;
            const dPh = getPhaseForDay(d, totalDays);
            const phColor = PHASES[dPh].color;
            let bg = "var(--bg-app)";
            if (!isFuture && dDone > 0) { const r = dDone / allCurTasks.length; bg = r >= 1 ? "#1D9E75" : r >= 0.5 ? "#5DCAA5" : "#9FE1CB"; }
            return (
              <div key={d} onClick={() => setSelectedDay(d === dayNumber ? null : d)}
                style={{
                  aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? "var(--text-main)" : bg,
                  color: isSelected ? "var(--bg-card)" : isFuture ? "var(--border)" : dDone > 0 ? "var(--bg-card)" : "var(--text-muted)",
                  border: isTodayDay && !isSelected ? `2px solid ${phColor}` : "none",
                  cursor: isFuture ? "default" : "pointer", transition: "all .15s"
                }}>
                {d}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Day info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {isToday ? "Today" : formatDate(viewKey)} · Day {viewDay}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{ph} Focus · {allCurTasks.length} tasks</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: doneTasks === allCurTasks.length ? "#1D9E75" : "var(--text-main)" }}>{doneTasks}/{allCurTasks.length}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>done</div>
        </div>
      </div>
      <PBar value={doneTasks} max={allCurTasks.length} color={doneTasks === allCurTasks.length ? "#1D9E75" : "#7F77DD"} h={6} />

      {/* Practice tasks */}
      <SLabel mt={10}>Practice tasks</SLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {allCurTasks.map(task => {
          const done = !!dayData.tasks?.[task.id];
          return (
            <div key={task.id} onClick={() => toggleTask(task.id)}
              style={{ background: "var(--bg-card)", border: `1px solid ${done ? "#9FE1CB" : "var(--border)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", userSelect: "none" }}>
              <CheckBox done={done} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? "var(--text-muted)" : "var(--text-main)", textDecoration: done ? "line-through" : "none" }}>{task.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{task.duration}</span>
                </div>
                {task.detail && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5 }}>{task.detail}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mindset checklist */}
      <SLabel mt={10}>Architect mindset ({doneChecks}/{MINDSET_CHECKS.length})</SLabel>
      <Card style={{ padding: "4px 0" }}>
        {MINDSET_CHECKS.map((item, i) => {
          const done = !!dayData.checklist?.[item.id];
          return (
            <div key={item.id} onClick={() => toggleCheck(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: i < MINDSET_CHECKS.length - 1 ? "1px solid var(--bg-app)" : "none", userSelect: "none" }}>
              <CheckBox done={done} size={18} circle />
              <span style={{ fontSize: 13, color: done ? "var(--text-muted)" : "var(--text-main)", textDecoration: done ? "line-through" : "none" }}>{item.label}</span>
              {done && <span style={{ marginLeft: "auto", fontSize: 11, color: "#1D9E75", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
      </Card>

      {isToday && (() => {
        const streak = calcStreak(data.days || {});
        if (streak >= 7) return <div style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#085041" }}>🔥 {streak}-day streak! Consistency is your competitive advantage.</div>;
        if (streak === 0 && doneTasks > 0) return <div style={{ background: "#EEEDFE", border: "1px solid #7F77DD", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#3C3489" }}>Great start today! Build your streak tomorrow.</div>;
        if (streak === 0) return <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-text)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--warning-text)" }}>Start your streak today. Every expert was once a beginner.</div>;
        return null;
      })()}
    </div>
  );
}
