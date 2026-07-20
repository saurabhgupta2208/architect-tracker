import React, { useState } from "react";
import { SIX_MONTH_PLAN } from "../utils";
import { Card, CheckBox, PBar, Badge } from "./SharedComponents";

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

const navBtnFull = { 
  flex: 1, 
  padding: "8px", 
  borderRadius: 10, 
  border: "1px solid var(--border)", 
  background: "transparent", 
  fontSize: 13, 
  cursor: "pointer", 
  color: "var(--text-main)" 
};

export default function PlanView({ data, onUpdate }) {
  const [activeMonth, setActiveMonth] = useState(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const [view, setView] = useState("abstract"); // abstract | detail

  const plan = data.sixMonthPlan || SIX_MONTH_PLAN;

  function toggleTask(monthIdx, weekIdx, taskId) {
    const updated = plan.map((m, mi) => mi !== monthIdx ? m : {
      ...m, weeks: m.weeks.map((w, wi) => wi !== weekIdx ? w : {
        ...w, tasks: w.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      })
    });
    onUpdate({ ...data, sixMonthPlan: updated });
  }

  const totalTasks = plan.reduce((a, m) => a + m.weeks.reduce((b, w) => b + w.tasks.length, 0), 0);
  const doneTasks = plan.reduce((a, m) => a + m.weeks.reduce((b, w) => b + w.tasks.filter(t => t.done).length, 0), 0);
  const m = plan[activeMonth];
  const w = m.weeks[activeWeek];
  const mDone = m.weeks.reduce((a, wk) => a + wk.tasks.filter(t => t.done).length, 0);
  const mTotal = m.weeks.reduce((a, wk) => a + wk.tasks.length, 0);
  const wDone = w.tasks.filter(t => t.done).length;

  return (
    <div>
      {/* Abstract / Detail toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setView("abstract")} style={{ ...tabBtn, ...(view === "abstract" ? tabActive : {}) }}>Abstract view</button>
        <button onClick={() => setView("detail")} style={{ ...tabBtn, ...(view === "detail" ? tabActive : {}) }}>Detailed view</button>
      </div>

      {/* Abstract view: 6-month overview grid */}
      {view === "abstract" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>Overall progress</span>
              <span>{doneTasks}/{totalTasks} tasks · {Math.round(doneTasks / totalTasks * 100)}%</span>
            </div>
            <PBar value={doneTasks} max={totalTasks} color="#7F77DD" h={8} />
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {plan.map((pm, mi) => {
              const pmDone = pm.weeks.reduce((a, w) => a + w.tasks.filter(t => t.done).length, 0);
              const pmTotal = pm.weeks.reduce((a, w) => a + w.tasks.length, 0);
              const pmPct = Math.round(pmDone / pmTotal * 100);
              const isActive = mi === activeMonth;
              return (
                <div key={mi} onClick={() => { setActiveMonth(mi); setActiveWeek(0); setView("detail"); }}
                  style={{ background: "var(--bg-card)", border: `2px solid ${isActive ? "#7F77DD" : "var(--border)"}`, borderRadius: 12, padding: "14px", cursor: "pointer", transition: "border-color .15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>Month {pm.month}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{pm.title}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: pmPct === 100 ? "#1D9E75" : pmPct > 0 ? "#7F77DD" : "var(--border)" }}>{pmPct}%</div>
                  </div>
                  <PBar value={pmDone} max={pmTotal} color={pmPct === 100 ? "#1D9E75" : "#7F77DD"} h={4} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{pmDone}/{pmTotal} tasks · {pm.weeks.length} weeks</div>
                  {/* Week dots */}
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {pm.weeks.map((wk, wi) => {
                      const wkDone = wk.tasks.filter(t => t.done).length;
                      const wkPct = wkDone / wk.tasks.length;
                      return <div key={wi} style={{ flex: 1, height: 4, borderRadius: 2, background: wkPct >= 1 ? "#1D9E75" : wkPct > 0 ? "#5DCAA5" : "var(--bg-app)" }} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail view: month + week breakdown */}
      {view === "detail" && (
        <div>
          {/* Month selector */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {plan.map((pm, mi) => {
              const pmDone = pm.weeks.reduce((a, w) => a + w.tasks.filter(t => t.done).length, 0);
              const pmTotal = pm.weeks.reduce((a, w) => a + w.tasks.length, 0);
              const pmPct = Math.round(pmDone / pmTotal * 100);
              return (
                <button key={mi} onClick={() => { setActiveMonth(mi); setActiveWeek(0); }}
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: activeMonth === mi ? "1px solid var(--text-main)" : "1px solid var(--border)", background: activeMonth === mi ? "var(--text-main)" : "transparent", color: activeMonth === mi ? "var(--bg-card)" : "var(--text-main)", cursor: "pointer" }}>
                  M{pm.month} · {pmPct}%
                </button>
              );
            })}
          </div>

          {/* Month header */}
          <div style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Month {m.month} of 6</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{m.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.6, marginBottom: 10 }}>{m.focus}</div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Month-end milestone</div>
              <div style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.5 }}>{m.milestone}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Month progress</span><span>{mDone}/{mTotal}</span>
              </div>
              <PBar value={mDone} max={mTotal} color={mDone === mTotal ? "#1D9E75" : "#7F77DD"} h={6} />
            </div>
          </div>

          {/* Week tabs */}
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {m.weeks.map((wk, wi) => {
              const wkDone = wk.tasks.filter(t => t.done).length;
              return (
                <button key={wi} onClick={() => setActiveWeek(wi)}
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: activeWeek === wi ? "1px solid #7F77DD" : "1px solid var(--border)", background: activeWeek === wi ? "#EEEDFE" : "transparent", color: activeWeek === wi ? "#3C3489" : "var(--text-main)", cursor: "pointer", fontWeight: activeWeek === wi ? 700 : 400 }}>
                  Week {wk.week} · {wkDone}/{wk.tasks.length}
                </button>
              );
            })}
          </div>

          {/* Week detail */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{w.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{w.goal}</div>
            <PBar value={wDone} max={w.tasks.length} color={wDone === w.tasks.length ? "#1D9E75" : "#7F77DD"} h={4} />
          </Card>

          {/* Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {w.tasks.map(task => (
              <div key={task.id} onClick={() => toggleTask(activeMonth, activeWeek, task.id)}
                style={{ background: "var(--bg-card)", border: `1px solid ${task.done ? "#9FE1CB" : "var(--border)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", userSelect: "none" }}>
                <CheckBox done={task.done} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: task.done ? "var(--text-muted)" : "var(--text-main)", textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.title}</span>
                    <Badge type={task.badge} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5, lineHeight: 1.5 }}>{task.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Month nav */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {activeMonth > 0 && <button onClick={() => { setActiveMonth(m => m - 1); setActiveWeek(0); }} style={navBtnFull}>← Month {activeMonth}</button>}
            {activeMonth < plan.length - 1 && <button onClick={() => { setActiveMonth(m => m + 1); setActiveWeek(0); }} style={{ ...navBtnFull, marginLeft: "auto" }}>Month {activeMonth + 2} →</button>}
          </div>
        </div>
      )}
    </div>
  );
}
