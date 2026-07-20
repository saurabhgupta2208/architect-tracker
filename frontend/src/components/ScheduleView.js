import React from "react";
import { getTodayKey, formatDate } from "../utils";
import { Card, DailyPlanSection } from "./SharedComponents";

export default function ScheduleView({ data, onUpdatePlanning }) {
  const todayKey = getTodayKey();
  const scheduleDays = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    return { key, label: i === 0 ? "Today" : formatDate(key) };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {scheduleDays.map(d => {
        const plan = data.dailyPlanning?.[d.key] || [];
        const achievedCount = plan.filter(p => p.achieved).length;
        const pct = plan.length ? Math.round((achievedCount / plan.length) * 100) : 0;

        return (
          <Card key={d.key} style={{ padding: 16, border: d.key === todayKey ? "2px solid var(--text-main)" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{d.label}</span>
              {plan.length > 0 && <span style={{ fontSize: 12, color: pct === 100 ? "#1D9E75" : "var(--text-muted)" }}>{pct}% complete</span>}
            </div>
            <DailyPlanSection plan={plan} onUpdate={(newPlan) => onUpdatePlanning(d.key, newPlan)} />
          </Card>
        );
      })}
    </div>
  );
}
