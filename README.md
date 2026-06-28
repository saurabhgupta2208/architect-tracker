# 🏗 Architect Tracker

**Daily discipline tool for Senior → Principal/Staff Architect transition**

---

## ⚡ Quick Start (Single Click)

```bash
chmod +x start.sh
./start.sh
```

That's it. The app opens in your browser at **http://localhost:3001**

---

## 📋 What's Inside

| View | What it does |
|------|-------------|
| **Today** | Daily task checklist (System Design, DSA, Revision, Communication) + Architect mindset check + Daily note |
| **Skills** | 20 pre-loaded skills with topic-level progress tracking. Add your own. |
| **6-Month Plan** | Full 6-month architect gap-closing plan with 30 tasks across 6 milestones |
| **History** | 60-day activity heatmap + day-by-day log |
| **Tasks** | Manage your daily practice tasks |
| **Notes** | All your daily notes in one place |

---

## 🎯 Pre-loaded Skills (20)

**Core CS:** DSA, LLD  
**Design:** System Design, Design Patterns  
**Java:** Java Core, Java 21 Features, Threads & Concurrency, Garbage Collection  
**Architecture:** SOLID Principles, Microservices, Microservice Patterns  
**Data:** SQL/Query, Hibernate/JPA  
**Cloud & Infra:** AWS, Docker, Kubernetes  
**Messaging & Cache:** Kafka, Redis, Memcached, Elasticsearch  

---

## 📁 Data Storage

All your data is saved to:
```
data/tracker.json
```

This is plain JSON — easy to back up, inspect, or migrate to SQLite later.

**Back up your data:**
```bash
cp data/tracker.json data/tracker_backup_$(date +%Y%m%d).json
```

---

## 🛑 Stop the Server

```bash
./stop.sh
# or press Ctrl+C in the terminal running start.sh
```

---

## 🖥 Add to Linux Desktop (optional)

To launch with a double-click from your desktop or app menu:

```bash
# Copy to desktop
cp ArchitectTracker.desktop ~/Desktop/
chmod +x ~/Desktop/ArchitectTracker.desktop

# Or add to application menu
cp ArchitectTracker.desktop ~/.local/share/applications/
# Edit the Exec line to use the full path to start.sh
```

---

## 🔧 Requirements

- Node.js 16+ (recommended: 18 or 20)
- npm
- Any modern browser

**Install Node.js on Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install nodejs npm
```

**Install Node.js via nvm (recommended):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
```

---

## 📂 Project Structure

```
architect-tracker/
├── start.sh              ← Single-click launcher
├── stop.sh               ← Stop the server
├── README.md
├── data/
│   └── tracker.json      ← All your data (auto-created)
├── backend/
│   ├── server.js         ← Express API + file storage
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js        ← Full React app
    │   └── index.js
    └── public/
        └── index.html
```

---

## 🔄 Migrating to SQLite later

When you're ready to move from JSON to SQLite, the data structure in `tracker.json` maps cleanly:

| JSON key | SQLite table |
|----------|-------------|
| `days` | `daily_logs` |
| `skills` | `skills` |
| `sixMonthPlan` | `plan_tasks` |
| `notes` | `notes` |
| `customTasks` | `custom_tasks` |
