import React, { useState } from "react";
import { 
  getTodayKey, 
  getDayNumber, 
  getDateKey, 
  calcStreak, 
  formatDate, 
  getPhaseForDay, 
  PHASES 
} from "../utils";
import { Card, PBar } from "./SharedComponents";

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

export default function HistoryView({ data, allTasks }) {
  const { totalDays, startDate } = data.settings;
  const todayKey = getTodayKey();
  const dayNumber = getDayNumber(startDate);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("abstract");

  const daysArr = Array.from({ length: Math.min(dayNumber, totalDays) }, (_, i) => {
    const key = getDateKey(startDate, i + 1);
    const d = data.days?.[key];
    const done = d ? Object.values(d.tasks || {}).filter(Boolean).length : 0;
    return { day: i + 1, key, done, total: allTasks.length };
  }).reverse();

  const filtered = daysArr.filter(d => {
    if (filter === "full") return d.done === d.total;
    if (filter === "partial") return d.done > 0 && d.done < d.total;
    if (filter === "missed") return d.done === 0;
    return true;
  });

  const totalDone = daysArr.filter(d => d.done === d.total).length;
  const streak = calcStreak(data.days || {});
  const bestStreak = (() => {
    let best = 0, cur = 0;
    for (let i = daysArr.length - 1; i >= 0; i--) {
      if (daysArr[i] && daysArr[i].done > 0) { cur++; best = Math.max(best, cur); } else cur = 0;
    }
    return best;
  })();

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[{ v: streak, l: "Current streak" }, { v: bestStreak, l: "Best streak" }, { v: totalDone, l: "Full days" }].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>{totalDays}-day heatmap</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {Array.from({ length: totalDays }, (_, i) => {
            const key = getDateKey(startDate, i + 1);
            const d = data.days?.[key];
            const done = d ? Object.values(d.tasks || {}).filter(Boolean).length : 0;
            const isFuture = i + 1 > dayNumber;
            const isToday = key === todayKey;
            let bg = "var(--bg-app)";
            if (!isFuture && done > 0) { const r = done / allTasks.length; bg = r >= 1 ? "#1D9E75" : r >= 0.5 ? "#5DCAA5" : "#9FE1CB"; }
            if (isToday) bg = "#7F77DD";
            return <div key={i} title={`${formatDate(key)} (Day ${i + 1}): ${done} tasks`} style={{ width: 14, height: 14, borderRadius: 3, background: isFuture ? "var(--bg-app)" : bg, border: isToday ? "2px solid #534AB7" : "none", opacity: isFuture ? 0.3 : 1 }} />;
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
          {[["#1D9E75", "Full"], ["#5DCAA5", "Partial"], ["#7F77DD", "Today"], ["var(--bg-app)", "Missed"]].map(([c, l]) => (
            <span key={l} style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ width: 10, height: 10, background: c, borderRadius: 2, display: "inline-block" }} />{l}</span>
          ))}
        </div>
      </Card>

      {/* View toggle + filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => setView("abstract")} style={{ ...tabBtn, ...(view === "abstract" ? tabActive : {}) }}>Abstract</button>
          <button onClick={() => setView("detail")} style={{ ...tabBtn, ...(view === "detail" ? tabActive : {}) }}>Detail</button>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["all", "All"], ["full", "Full"], ["partial", "Partial"], ["missed", "Missed"]].map(([f, l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: filter === f ? "1px solid var(--text-main)" : "1px solid var(--border)", background: filter === f ? "var(--text-main)" : "transparent", color: filter === f ? "var(--bg-card)" : "var(--text-muted)", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Abstract: weekly summary bars */}
      {view === "abstract" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: Math.ceil(Math.min(dayNumber, totalDays) / 7) }, (_, wi) => {
            const weekDays = daysArr.filter(d => d.day >= (wi * 7 + 1) && d.day <= (wi + 1) * 7);
            const wDone = weekDays.filter(d => d.done === d.total).length;
            const wPartial = weekDays.filter(d => d.done > 0 && d.done < d.total).length;
            const wTotal = weekDays.length;
            const wPct = wTotal > 0 ? Math.round((weekDays.reduce((a, d) => a + d.done, 0) / (wTotal * allTasks.length)) * 100) : 0;
            return (
              <Card key={wi} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Week {wi + 1}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{wDone} full · {wPartial} partial · {wTotal - wDone - wPartial} missed</span>
                </div>
                <PBar value={wPct} max={100} color={wPct >= 80 ? "#1D9E75" : wPct >= 40 ? "#7F77DD" : "#D85A30"} h={6} />
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {weekDays.map(d => (
                    <div key={d.day} style={{ flex: 1, height: 24, borderRadius: 5, background: d.done === d.total ? "#1D9E75" : d.done > 0 ? "#5DCAA5" : "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: d.done > 0 ? "var(--bg-card)" : "var(--text-muted)" }}>{d.day}</div>
                  ))}
                </div>
              </Card>
            );
          }).reverse()}
        </div>
      )}

      {/* Detail: day-by-day */}
      {view === "detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "24px 0" }}>No history yet.</div>
          ) : filtered.map(d => {
            const ph = getPhaseForDay(d.day, totalDays); const ps = PHASES[ph];
            const dNotes = data.dailyNotes?.[d.key] || [];
            return (
              <Card key={d.key} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(d.key)} · Day {d.day}</div>
                    <span style={{ fontSize: 10, color: ps.text, background: ps.bg, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>{ph}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.done === d.total ? "#1D9E75" : d.done > 0 ? "#7F77DD" : "var(--border)" }}>{d.done}/{d.total}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}><PBar value={d.done} max={d.total} color={d.done === d.total ? "#1D9E75" : "#7F77DD"} h={4} /></div>
                {dNotes.length > 0 && (
                  <div style={{ fontSize: 12, color: "var(--text-main)", marginTop: 8, borderTop: "1px solid var(--bg-app)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {dNotes.map(n => (
                      <div key={n.id} style={{ display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 10, alignSelf: "center" }}>•</span>
                        <span>{n.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
