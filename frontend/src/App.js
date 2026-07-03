import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:3001/api";

// ─── Motivational quotes ──────────────────────────────────────
const QUOTES = [
  { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
  { q: "An architect is not someone who builds walls, but someone who opens doors.", a: "Adapted" },
  { q: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", a: "John C. Maxwell" },
  { q: "You don't rise to the level of your goals. You fall to the level of your systems.", a: "James Clear" },
  { q: "The expert in anything was once a beginner who refused to quit.", a: "Helen Hayes" },
  { q: "Consistency is the hallmark of the unimaginative.", a: "Oscar Wilde — prove him wrong." },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
  { q: "Every day you don't practice, you're getting worse.", a: "The Senior Engineer's Paradox" },
  { q: "Design is not just what it looks like. Design is how it works.", a: "Steve Jobs" },
  { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
  { q: "Simple systems are harder to build than complex ones.", a: "Architect's Paradox" },
  { q: "The goal is not to be perfect by the end. The goal is to be better today than yesterday.", a: "Simon Sinek" },
];

// ─── Constants ────────────────────────────────────────────────
const PHASES = {
  Foundation: { color: "#5DCAA5", bg: "#E1F5EE", text: "#085041", days: "Days 1–20" },
  Scaling: { color: "#7F77DD", bg: "#EEEDFE", text: "#3C3489", days: "Days 21–40" },
  "Interview Ready": { color: "#D85A30", bg: "#FAECE7", text: "#712B13", days: "Days 41–60" },
};

const PHASE_GUIDANCE = {
  Foundation: { focus: "DSA + Basics", tips: ["Master Trees, Graphs, Sliding Window, Heap, LRU", "CAP theorem, consistency, replication, sharding", "Microservices: Saga, API Gateway, Circuit Breaker"] },
  Scaling: { focus: "DSA + Design", tips: ["6–8 end-to-end system designs with API + DB schema", "Kubernetes basics, load balancing, multi-region", "P95/P99 latency, thread pools, backpressure, GC basics"] },
  "Interview Ready": { focus: "Mocks + Advanced", tips: ["CQRS, event sourcing, time-series storage", "SLA/SLO, disaster recovery, failover design", "3 System Design + 3 DSA + 2 Behavioral mocks"] },
};

// 60-day curriculum: each day maps to a phase, week, and suggested focus
const DAY_CURRICULUM = Array.from({ length: 60 }, (_, i) => {
  const d = i + 1;
  const phase = d <= 20 ? "Foundation" : d <= 40 ? "Scaling" : "Interview Ready";
  const week = Math.ceil(d / 7);
  const focuses = {
    Foundation: ["Core DSA — Trees & Recursion", "Core DSA — Graphs & BFS/DFS", "Core DSA — Sliding Window & Two Pointer", "Core DSA — Heap & Priority Queue", "Distributed Systems — CAP, Consistency", "Microservices Patterns — Saga, Circuit Breaker", "Revision & Mock"],
    Scaling: ["System Design — URL Shortener & Rate Limiter", "System Design — Chat & Notification System", "System Design — Analytics Pipeline", "Cloud & Infra — Kubernetes & Docker", "Performance — P99 Latency, Thread Pools, GC", "System Design — Search & Autocomplete", "Revision & Mock"],
    "Interview Ready": ["Data Systems — CQRS, Event Sourcing", "Reliability — SLO/SLA, Observability", "Leadership Stories — Conflict, Tech Debt", "Mock Interviews — System Design ×3", "Mock Interviews — DSA ×3", "Mock Interviews — Behavioral ×2", "Final Revision & Gap Fix"],
  };
  const focusArr = focuses[phase];
  const focusIdx = (d - (d <= 20 ? 1 : d <= 40 ? 21 : 41)) % focusArr.length;
  return { day: d, phase, week, focus: focusArr[focusIdx] };
});

const DEFAULT_TASKS = [
  { id: "sys-design", category: "System Design", label: "System design study", duration: "60 min", detail: "Practice one end-to-end design — URL shortener, rate limiter, analytics, chat, etc." },
  { id: "dsa", category: "DSA", label: "DSA problem solving", duration: "45 min", detail: "LeetCode medium/hard — Trees, Graphs, Sliding Window, Heap, DP" },
  { id: "revision", category: "Revision", label: "Revision & notes", duration: "20 min", detail: "Review yesterday's notes. Consolidate patterns and key trade-offs." },
  { id: "speak", category: "Communication", label: "Speak design aloud", duration: "15 min", detail: "Explain a system design out loud. Framework: Clarify → HLD → Deep Dive → Trade-offs → Risks." },
];

const MINDSET_CHECKS = [
  { id: "scale", label: "Thought about scale?" },
  { id: "tradeoff", label: "Analysed trade-offs?" },
  { id: "comm", label: "Practised communication?" },
  { id: "learn", label: "Learned something new?" },
];

const BADGE_COLORS = {
  cloud: { bg: "#E6F1FB", text: "#185FA5" },
  depth: { bg: "#E1F5EE", text: "#085041" },
  visibility: { bg: "#FAEEDA", text: "#854F0B" },
  leadership: { bg: "#EEEDFE", text: "#3C3489" },
};

const CATEGORY_ORDER = ["Core CS", "Design", "Java", "Architecture", "Data", "Cloud & Infra", "Messaging & Cache"];

// ─── Six-month plan data ──────────────────────────────────────
const SIX_MONTH_PLAN = [
  {
    month: 1, title: "Cloud foundation",
    focus: "Get hands dirty with AWS. Rebuild one existing project on AWS. Replace Prometheus with CloudWatch.",
    milestone: "Deploy Spring Boot microservice on EKS with RDS, behind ALB. Push metrics to CloudWatch. GitHub repo live.",
    weeks: [
      {
        week: 1, title: "AWS account + Well-Architected labs", goal: "Set up AWS, complete compute & networking labs",
        tasks: [
          { id: "m1w1t1", title: "Create AWS free tier account", detail: "Sign up at aws.amazon.com/free — t2.micro is always free", badge: "cloud", done: false },
          { id: "m1w1t2", title: "Complete AWS Well-Architected labs — compute module", detail: "aws.amazon.com/architecture/well-architected — focus on EC2, ECS basics", badge: "cloud", done: false },
          { id: "m1w1t3", title: "Complete AWS Well-Architected labs — networking module", detail: "VPC, subnets, security groups, ALB concepts", badge: "cloud", done: false },
          { id: "m1w1t4", title: "Create GitHub profile with pinned repos + README", detail: "Include CDC project description with code samples even if internal", badge: "visibility", done: false },
        ]
      },
      {
        week: 2, title: "Rebuild TJ5600 on AWS", goal: "Deploy containerised service end-to-end on AWS",
        tasks: [
          { id: "m1w2t1", title: "Containerise TJ5600 analytics service with Docker", detail: "Multi-stage Dockerfile, push to ECR", badge: "cloud", done: false },
          { id: "m1w2t2", title: "Deploy to ECS Fargate with RDS PostgreSQL", detail: "Use Terraform or CloudFormation to define infra-as-code", badge: "cloud", done: false },
          { id: "m1w2t3", title: "Add ALB in front + HTTPS via ACM certificate", detail: "Set up target groups, health checks, listener rules", badge: "cloud", done: false },
        ]
      },
      {
        week: 3, title: "Observability + SLOs", goal: "Replace Prometheus with CloudWatch, define 3 SLOs",
        tasks: [
          { id: "m1w3t1", title: "Instrument Spring Boot app with CloudWatch metrics", detail: "Use AWS SDK for Java + CloudWatch Embedded Metrics Format", badge: "cloud", done: false },
          { id: "m1w3t2", title: "Define 3 SLOs: availability, p99 latency, error rate", detail: "Create CloudWatch Alarms + Dashboard. Document SLOs in Confluence", badge: "depth", done: false },
          { id: "m1w3t3", title: "Set up CloudWatch Logs Insights queries for troubleshooting", detail: "Write 3 saved queries: error spike, slow requests, deployment events", badge: "depth", done: false },
        ]
      },
      {
        week: 4, title: "Blog post + GitHub", goal: "Publish first technical blog post",
        tasks: [
          { id: "m1w4t1", title: "Write blog post #1: 'How we implemented CDC with Debezium'", detail: "1200+ words, architecture diagram, publish on Medium or dev.to", badge: "visibility", done: false },
          { id: "m1w4t2", title: "Share post in 2 relevant Slack communities or LinkedIn", detail: "Java community, Debezium users, microservices groups", badge: "visibility", done: false },
        ]
      },
    ]
  },
  {
    month: 2, title: "Reliability & SRE culture",
    focus: "Learn the language of reliability. Reframe Prometheus/Grafana work in architect language — SLOs, error budgets, fault tolerance.",
    milestone: "Write one ADR for a real past decision. Define SLOs for current project at TN. Present to team.",
    weeks: [
      {
        week: 1, title: "SRE fundamentals", goal: "Read SRE book chapters 1–6, understand SLO framework",
        tasks: [
          { id: "m2w1t1", title: "Read SRE book chapters 1–6 (Google SRE book — free online)", detail: "Focus: intro to SRE, SLOs, SLIs, error budgets. sre.google/sre-book", badge: "depth", done: false },
          { id: "m2w1t2", title: "Read SRE book chapters 13–17 (on-call & incident management)", detail: "Especially chapter 14: Managing Incidents", badge: "depth", done: false },
          { id: "m2w1t3", title: "Document SLIs and SLOs for TJ5600 analytics server", detail: "Availability SLO: 99.9%. Latency SLO: p99 < 200ms. Error rate < 0.1%", badge: "leadership", done: false },
        ]
      },
      {
        week: 2, title: "Fault tolerance patterns", goal: "Implement circuit breaker + retry in one service",
        tasks: [
          { id: "m2w2t1", title: "Add Resilience4j circuit breaker to one microservice", detail: "Configure failure rate threshold, slow call threshold, half-open state", badge: "depth", done: false },
          { id: "m2w2t2", title: "Add retry with exponential backoff + jitter", detail: "Max 3 retries, base interval 100ms, max 2s. Document failure modes handled", badge: "depth", done: false },
          { id: "m2w2t3", title: "Write runbook for the circuit breaker: when it trips, how to recover", detail: "1 page max. Store in team Confluence or Notion", badge: "leadership", done: false },
        ]
      },
      {
        week: 3, title: "ADR writing", goal: "Write and share one Architecture Decision Record",
        tasks: [
          { id: "m2w3t1", title: "Write ADR for monolith-to-microservices migration decision", detail: "Use Michael Nygard's template: Title → Status → Context → Decision → Consequences", badge: "leadership", done: false },
          { id: "m2w3t2", title: "Share ADR with team for review — get at least 2 comments", detail: "Post in team Confluence. Ask specifically: 'What would you have decided differently?'", badge: "leadership", done: false },
          { id: "m2w3t3", title: "Write second ADR for a current or upcoming decision", detail: "Service discovery approach, DB choice, caching strategy — pick a real decision", badge: "leadership", done: false },
        ]
      },
      {
        week: 4, title: "Blog post #2", goal: "Publish failure patterns post",
        tasks: [
          { id: "m2w4t1", title: "Write blog post #2: 'Designing for failure: patterns I use in Java microservices'", detail: "Cover: circuit breakers, bulkheads, idempotency, retry. 1000+ words", badge: "visibility", done: false },
          { id: "m2w4t2", title: "Update LinkedIn with AWS work from Month 1 + reliability patterns", detail: "Add a post about the CDC → SLO journey. 300–400 words", badge: "visibility", done: false },
        ]
      },
    ]
  },
  {
    month: 3, title: "System design depth",
    focus: "Interview prep month. You have the raw experience — now build the vocabulary and structured thinking to present it clearly under pressure.",
    milestone: "Complete 8 system design practice sessions. Write up TJ5600 as a case study. Book AWS SAA exam.",
    weeks: [
      {
        week: 1, title: "Read DDIA", goal: "Complete Kleppmann's 'Designing Data-Intensive Applications'",
        tasks: [
          { id: "m3w1t1", title: "Read DDIA Part I: Foundations of data systems (chapters 1–3)", detail: "Reliability, scalability, maintainability. Data models, storage engines", badge: "depth", done: false },
          { id: "m3w1t2", title: "Read DDIA Part II: Distributed data (chapters 5–9)", detail: "Replication, partitioning, transactions — the most interview-relevant chapters", badge: "depth", done: false },
          { id: "m3w1t3", title: "Read DDIA Part III: Derived data (chapters 10–12)", detail: "Batch processing, stream processing, future of data systems", badge: "depth", done: false },
        ]
      },
      {
        week: 2, title: "System design practice ×4", goal: "Practice 4 designs with full write-up",
        tasks: [
          { id: "m3w2t1", title: "Design: URL shortener + rate limiter (pair, 60 min each on Excalidraw)", detail: "Include: API design, DB schema, caching, scaling, failure modes, capacity estimate", badge: "depth", done: false },
          { id: "m3w2t2", title: "Design: Twitter feed + notification system", detail: "Focus on fan-out problem, push vs pull, hot celebrity problem", badge: "depth", done: false },
          { id: "m3w2t3", title: "Write up TJ5600 as a full system design case study", detail: "Capacity estimates → HLD → Deep dive → Trade-offs → What you'd do differently", badge: "visibility", done: false },
        ]
      },
      {
        week: 3, title: "System design practice ×4", goal: "Complete 4 more designs",
        tasks: [
          { id: "m3w3t1", title: "Design: Distributed cache (Redis-like) + search autocomplete", detail: "Consistent hashing, cache eviction policies, trie vs DB for autocomplete", badge: "depth", done: false },
          { id: "m3w3t2", title: "Design: Analytics pipeline (your domain — should be strong)", detail: "Event ingestion → Kafka → stream processing → time-series storage → dashboards", badge: "depth", done: false },
          { id: "m3w3t3", title: "Design: Chat system + video streaming service", detail: "WebSockets vs long polling, CDN edge caching, adaptive bitrate streaming", badge: "depth", done: false },
        ]
      },
      {
        week: 4, title: "AWS SAA prep + cross-team docs", goal: "Book exam, document cross-team influence",
        tasks: [
          { id: "m3w4t1", title: "Book AWS SAA-C03 exam — schedule 6 weeks out", detail: "Pearson VUE or PSI. Use Stephane Maarek's Udemy course + Tutorials Dojo practice tests", badge: "cloud", done: false },
          { id: "m3w4t2", title: "Document 5 cross-team decisions you made or influenced", detail: "List: RFCs written, standards others adopted, design reviews you ran for other teams", badge: "leadership", done: false },
        ]
      },
    ]
  },
  {
    month: 4, title: "Cloud certification + security",
    focus: "Pass the AWS SAA exam. Close the security architecture gap — comes up in every Staff+ interview at product companies.",
    milestone: "AWS SAA-C03 certified. Add one security architecture pattern to current project.",
    weeks: [
      {
        week: 1, title: "AWS SAA intensive study", goal: "Complete Maarek course + first practice test",
        tasks: [
          { id: "m4w1t1", title: "Complete Stephane Maarek AWS SAA course (Udemy)", detail: "Focus sections: EC2, S3, RDS, VPC, IAM, ECS/EKS, CloudFront, Route 53", badge: "cloud", done: false },
          { id: "m4w1t2", title: "Take first Tutorials Dojo practice test — note weak areas", detail: "Target 60%+ on first attempt. Create a weak-area cheat sheet", badge: "cloud", done: false },
          { id: "m4w1t3", title: "Implement AWS Secrets Manager for all credentials in your project", detail: "Remove every hardcoded config. Document the secrets rotation strategy", badge: "cloud", done: false },
        ]
      },
      {
        week: 2, title: "Security architecture", goal: "Add mTLS + JWT service-to-service auth",
        tasks: [
          { id: "m4w2t1", title: "Add JWT-based service-to-service authentication between 2 microservices", detail: "Use Spring Security + JWKS endpoint. Document the trust model", badge: "depth", done: false },
          { id: "m4w2t2", title: "Write up service auth as a security design pattern doc", detail: "1-pager: problem → solution → trade-offs vs API keys, mTLS, OAuth client credentials", badge: "visibility", done: false },
          { id: "m4w2t3", title: "Review OWASP Top 10 for APIs — check your services against it", detail: "owasp.org/API-Security. Document findings and any gaps in your services", badge: "depth", done: false },
        ]
      },
      {
        week: 3, title: "AWS SAA practice tests", goal: "Score 80%+ on 3 practice tests",
        tasks: [
          { id: "m4w3t1", title: "Complete 3 more Tutorials Dojo practice tests — target 80%+", detail: "Review every wrong answer. Focus on scenario-based questions about architecture trade-offs", badge: "cloud", done: false },
          { id: "m4w3t2", title: "Reach out to 2 senior engineers at Flipkart / Razorpay / Atlassian", detail: "LinkedIn DM. Ask about Staff architect interview process — not job openings", badge: "leadership", done: false },
        ]
      },
      {
        week: 4, title: "AWS SAA exam + blog post #3", goal: "Pass the exam. Publish lessons-from-migration post.",
        tasks: [
          { id: "m4w4t1", title: "Take and pass AWS SAA-C03 exam", detail: "You're ready if scoring 80%+ on practice tests. Trust the prep.", badge: "cloud", done: false },
          { id: "m4w4t2", title: "Write blog post #3: 'Lessons from migrating a monolith to microservices'", detail: "Be honest about failures. Engineers trust posts that share what went wrong. 1200+ words", badge: "visibility", done: false },
        ]
      },
    ]
  },
  {
    month: 5, title: "Leadership footprint",
    focus: "Stop being the best engineer in the room. Start being the one who changes how the room works. Broaden your visible impact beyond your own team.",
    milestone: "Cross-team design guild running. RFC adopted outside your team. Open-source contribution merged.",
    weeks: [
      {
        week: 1, title: "Launch design guild", goal: "Propose and run first cross-team design session",
        tasks: [
          { id: "m5w1t1", title: "Draft 1-page proposal for a bi-weekly architecture design guild", detail: "Name, purpose, format (60 min), how to submit designs, who it's open to", badge: "leadership", done: false },
          { id: "m5w1t2", title: "Send Slack outreach to 5–8 engineers across 2+ teams", detail: "Voluntary, peer-to-peer, no management involvement. Goal: 4+ confirmations for session 1", badge: "leadership", done: false },
          { id: "m5w1t3", title: "Run session 1: present TJ5600 design, invite challenge", detail: "Prepare a Miro board or 15 slides. Ask: 'What failure modes am I missing?'", badge: "leadership", done: false },
        ]
      },
      {
        week: 2, title: "Write cross-team RFC", goal: "Draft and share RFC that spans 2+ teams",
        tasks: [
          { id: "m5w2t1", title: "Pick RFC topic that affects 2+ teams (e.g. CDC pattern standard, SLO framework)", detail: "Good candidates: Kafka topic naming policy, circuit breaker config standards, schema registry adoption", badge: "leadership", done: false },
          { id: "m5w2t2", title: "Write full RFC using Google design doc format (5 sections)", detail: "Context → Goals/Non-goals → Proposal → Alternatives → Risks. Target 2–4 pages", badge: "leadership", done: false },
          { id: "m5w2t3", title: "Share with 3 reviewers from different teams — set 10-day review window", detail: "Ask specific questions to drive comments. Update doc with decisions made.", badge: "leadership", done: false },
        ]
      },
      {
        week: 3, title: "Open-source contribution", goal: "Submit first contribution to Debezium or Spring",
        tasks: [
          { id: "m5w3t1", title: "Browse Debezium / Spring Boot issues for 'good first issue' labels", detail: "Spend 1 hour browsing. Pick one documentation or small bug issue to claim.", badge: "visibility", done: false },
          { id: "m5w3t2", title: "Submit PR or detailed bug report with minimal repro case", detail: "For a PR: fork, fix, test locally, open PR with clear description + issue reference", badge: "visibility", done: false },
        ]
      },
      {
        week: 4, title: "Blog post #4 + resume rewrite", goal: "Publish back-of-envelope post, rewrite resume in architect language",
        tasks: [
          { id: "m5w4t1", title: "Write blog post #4: 'Back-of-envelope estimation — how I think about scale'", detail: "Use TJ5600 as worked example. Traffic → storage → bandwidth estimates with real numbers", badge: "visibility", done: false },
          { id: "m5w4t2", title: "Rewrite every resume bullet in architect framing", detail: "Decision made + team/org scope + business outcome. Kill all 'implemented X' bullets.", badge: "leadership", done: false },
        ]
      },
    ]
  },
  {
    month: 6, title: "Interview readiness",
    focus: "You're not preparing anymore — you're ready. This month is about polish, portfolio, and converting pipeline to offers.",
    milestone: "Architecture portfolio live. 3 mock system design interviews done. 5 target companies applied to.",
    weeks: [
      {
        week: 1, title: "Architecture portfolio", goal: "Build public portfolio of technical work",
        tasks: [
          { id: "m6w1t1", title: "Build architecture portfolio on GitHub Pages or Notion", detail: "Include: TJ5600 case study, CDC write-up, ADRs, all 5 blog posts, RFC summary", badge: "visibility", done: false },
          { id: "m6w1t2", title: "Record a 10-minute Loom walkthrough of your TJ5600 design", detail: "Explain: the problem, your decisions, the trade-offs, what you'd change. Link in portfolio", badge: "visibility", done: false },
        ]
      },
      {
        week: 2, title: "Mock interviews ×3", goal: "Complete 3 system design mocks on Pramp",
        tasks: [
          { id: "m6w2t1", title: "Complete 3 mock system design interviews on Pramp or with peers", detail: "Record them. Review and identify vocabulary gaps after each one", badge: "depth", done: false },
          { id: "m6w2t2", title: "Complete 3 mock DSA interviews on LeetCode Mock / Pramp", detail: "Timed — 45 min each. Focus on communication: narrate your approach as you code", badge: "depth", done: false },
          { id: "m6w2t3", title: "Complete 2 mock behavioural interviews with a peer", detail: "Prepare: influence without authority, technical disagreement, failure story, cross-team collaboration", badge: "leadership", done: false },
        ]
      },
      {
        week: 3, title: "STAR stories + applications", goal: "Prepare 8 STAR stories, apply to 5 companies",
        tasks: [
          { id: "m6w3t1", title: "Prepare 8 STAR stories: influence, failure, decision, trade-off, conflict, hiring, strategy, mentoring", detail: "Each story should demonstrate architect-level scope. Write them down — don't wing it", badge: "leadership", done: false },
          { id: "m6w3t2", title: "Apply to 5 target companies in Bengaluru via referral", detail: "Atlassian, Razorpay, PhonePe, Adobe, Flipkart. Referrals get 3× more interviews than cold apps", badge: "leadership", done: false },
        ]
      },
      {
        week: 4, title: "Blog post #5 + final polish", goal: "Capstone post live, all gaps addressed",
        tasks: [
          { id: "m6w4t1", title: "Write blog post #5: 'How I think about distributed systems trade-offs'", detail: "Your capstone. Synthesise everything from the past 6 months. This is the post that defines your brand.", badge: "visibility", done: false },
          { id: "m6w4t2", title: "Fix any remaining interview weak spots identified from mocks", detail: "Re-do practice problems in 2 weakest areas. Book 1 more mock if needed.", badge: "depth", done: false },
        ]
      },
    ]
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function getTodayKey() { return new Date().toISOString().split("T")[0]; }

function getDateKey(startDate, dayNum) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toISOString().split("T")[0];
}

function formatDate(dateKey) {
  if (!dateKey) return "";
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(dateKey));
}

function formatFullDate(dateKey) {
  if (!dateKey) return "";
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateKey));
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

function getPhaseForDay(day, totalDays = 60) {
  const p1 = Math.floor(totalDays / 3);
  const p2 = p1 * 2;
  return day <= p1 ? "Foundation" : day <= p2 ? "Scaling" : "Interview Ready";
}

function getDayNumber(startDate) {
  const s = new Date(startDate); const t = new Date();
  s.setHours(0, 0, 0, 0); t.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((t - s) / 86400000) + 1);
}

function calcStreak(days) {
  let streak = 0; const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const day = days[key];
    if (day && day.tasks && Object.values(day.tasks).some(Boolean)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getPhaseAwareTasks(dayNum, phase) {
  const weekday = new Date().getDay(); // 0=Sun, 1=Mon...
  const tasks = [...DEFAULT_TASKS];

  if (phase === "Foundation") {
    tasks.push({ id: "basics", category: "Core CS", label: "OS & Networking", duration: "30 min", detail: "Process vs Thread, TCP/IP, DNS, Load Balancers" });
  } else if (phase === "Scaling") {
    tasks.push({ id: "scaling", category: "Architecture", label: "Scaling patterns", duration: "30 min", detail: "Sharding, Replication, Caching strategies, CDNs" });
  } else {
    tasks.push({ id: "mocks", category: "Staff+", label: "Advanced Design", duration: "45 min", detail: "Saga, Event Sourcing, mTLS, Zero Trust Arch" });
  }

  // Day-of-week variety
  if (weekday === 6 || weekday === 0) { // Weekend
    tasks.push({ id: "weekend", category: "Review", label: "Weekly Review", duration: "30 min", detail: "Consolidate all notes from this week into a single document." });
  }

  return tasks;
}
function getDailyQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

// ─── API calls ────────────────────────────────────────────────
async function apiGet(path) {
  try { const r = await fetch(API + path); return await r.json(); } catch { return null; }
}
async function apiPut(path, body) {
  try { await fetch(API + path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); } catch { }
}

// ─── Shared UI primitives ─────────────────────────────────────
function CheckBox({ done, size = 20, circle = false }) {
  return (
    <div style={{ width: size, height: size, borderRadius: circle ? "50%" : 5, border: done ? "none" : "1.5px solid #ccc", background: done ? "#1D9E75" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
      {done && <svg width={size * .58} height={size * .58} viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}
function PBar({ value, max, color = "#7F77DD", h = 5 }) {
  const p = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div style={{ height: h, background: "#F0EEE8", borderRadius: h / 2, overflow: "hidden" }}><div style={{ height: "100%", width: p + "%", background: color, borderRadius: h / 2, transition: "width .4s" }} /></div>;
}
function Card({ children, style = {} }) {
  return <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 12, padding: "14px 16px", ...style }}>{children}</div>;
}
function SLabel({ children, mt = 16 }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, marginTop: mt }}>{children}</div>;
}
function Badge({ type }) {
  const c = BADGE_COLORS[type] || { bg: "#f0f0f0", text: "#555" };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: c.bg, color: c.text, textTransform: "uppercase", letterSpacing: ".04em", flexShrink: 0 }}>{type}</span>;
}

// ─── TODAY VIEW ───────────────────────────────────────────────
function TodayView({ data, onUpdate }) {
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
          <span style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>Progress Calendar</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setWeekOffset(w => Math.max(-currentWeek + 1, w - 1))} style={navBtn}>‹</button>
            <span style={{ fontSize: 11, color: "#888", padding: "0 4px", alignSelf: "center" }}>Week {startWeek}</span>
            <button onClick={() => setWeekOffset(w => Math.min(Math.ceil(totalDays / 7) - startWeek + 1, w + 1))} style={navBtn}>›</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ fontSize: 10, color: "#bbb", textAlign: "center", fontWeight: 700 }}>{d}</div>)}
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
            let bg = "#F7F6F3";
            if (!isFuture && dDone > 0) { const r = dDone / allCurTasks.length; bg = r >= 1 ? "#1D9E75" : r >= 0.5 ? "#5DCAA5" : "#9FE1CB"; }
            return (
              <div key={d} onClick={() => setSelectedDay(d === dayNumber ? null : d)}
                style={{
                  aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? "#1a1a1a" : bg,
                  color: isSelected ? "#fff" : isFuture ? "#ddd" : dDone > 0 ? "#fff" : "#888",
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
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{ph} Focus · {allCurTasks.length} tasks</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: doneTasks === allCurTasks.length ? "#1D9E75" : "#1a1a1a" }}>{doneTasks}/{allCurTasks.length}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>done</div>
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
              style={{ background: "#fff", border: `1px solid ${done ? "#9FE1CB" : "#E8E6E0"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", userSelect: "none" }}>
              <CheckBox done={done} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? "#aaa" : "#1a1a1a", textDecoration: done ? "line-through" : "none" }}>{task.label}</span>
                  <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>{task.duration}</span>
                </div>
                {task.detail && <div style={{ fontSize: 12, color: "#888", marginTop: 3, lineHeight: 1.5 }}>{task.detail}</div>}
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
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: i < MINDSET_CHECKS.length - 1 ? "1px solid #F7F6F3" : "none", userSelect: "none" }}>
              <CheckBox done={done} size={18} circle />
              <span style={{ fontSize: 13, color: done ? "#aaa" : "#333", textDecoration: done ? "line-through" : "none" }}>{item.label}</span>
              {done && <span style={{ marginLeft: "auto", fontSize: 11, color: "#1D9E75", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
      </Card>

      {isToday && (() => {
        const streak = calcStreak(data.days || {});
        if (streak >= 7) return <div style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#085041" }}>🔥 {streak}-day streak! Consistency is your competitive advantage.</div>;
        if (streak === 0 && doneTasks > 0) return <div style={{ background: "#EEEDFE", border: "1px solid #7F77DD", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#3C3489" }}>Great start today! Build your streak tomorrow.</div>;
        if (streak === 0) return <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#633806" }}>Start your streak today. Every expert was once a beginner.</div>;
        return null;
      })()}
    </div>
  );
}

// ─── PLAN VIEW ────────────────────────────────────────────────
function PlanView({ data, onUpdate }) {
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 8 }}>
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
                  style={{ background: "#fff", border: `2px solid ${isActive ? "#7F77DD" : "#E8E6E0"}`, borderRadius: 12, padding: "14px", cursor: "pointer", transition: "border-color .15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>Month {pm.month}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{pm.title}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: pmPct === 100 ? "#1D9E75" : pmPct > 0 ? "#7F77DD" : "#ddd" }}>{pmPct}%</div>
                  </div>
                  <PBar value={pmDone} max={pmTotal} color={pmPct === 100 ? "#1D9E75" : "#7F77DD"} h={4} />
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{pmDone}/{pmTotal} tasks · {pm.weeks.length} weeks</div>
                  {/* Week dots */}
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {pm.weeks.map((wk, wi) => {
                      const wkDone = wk.tasks.filter(t => t.done).length;
                      const wkPct = wkDone / wk.tasks.length;
                      return <div key={wi} style={{ flex: 1, height: 4, borderRadius: 2, background: wkPct >= 1 ? "#1D9E75" : wkPct > 0 ? "#5DCAA5" : "#F0EEE8" }} />;
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
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: activeMonth === mi ? "1px solid #1a1a1a" : "1px solid #ddd", background: activeMonth === mi ? "#1a1a1a" : "transparent", color: activeMonth === mi ? "#fff" : "#555", cursor: "pointer" }}>
                  M{pm.month} · {pmPct}%
                </button>
              );
            })}
          </div>

          {/* Month header */}
          <div style={{ background: "#F7F6F3", border: "1px solid #E8E6E0", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Month {m.month} of 6</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{m.title}</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>{m.focus}</div>
            <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 4 }}>Month-end milestone</div>
              <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{m.milestone}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
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
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, border: activeWeek === wi ? "1px solid #7F77DD" : "1px solid #ddd", background: activeWeek === wi ? "#EEEDFE" : "transparent", color: activeWeek === wi ? "#3C3489" : "#555", cursor: "pointer", fontWeight: activeWeek === wi ? 700 : 400 }}>
                  Week {wk.week} · {wkDone}/{wk.tasks.length}
                </button>
              );
            })}
          </div>

          {/* Week detail */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{w.title}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{w.goal}</div>
            <PBar value={wDone} max={w.tasks.length} color={wDone === w.tasks.length ? "#1D9E75" : "#7F77DD"} h={4} />
          </Card>

          {/* Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {w.tasks.map(task => (
              <div key={task.id} onClick={() => toggleTask(activeMonth, activeWeek, task.id)}
                style={{ background: "#fff", border: `1px solid ${task.done ? "#9FE1CB" : "#E8E6E0"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", userSelect: "none" }}>
                <CheckBox done={task.done} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: task.done ? "#aaa" : "#1a1a1a", textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.title}</span>
                    <Badge type={task.badge} />
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 5, lineHeight: 1.5 }}>{task.detail}</div>
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

// ─── SKILLS VIEW ─────────────────────────────────────────────
function SkillsView({ skills, onSave }) {
  const [editSkill, setEditSkill] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [addNew, setAddNew] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "Core CS", color: "#7F77DD", topics: [], notes: "", proficiency: 0, target: 80 });
  const [view, setView] = useState("abstract"); // abstract | detail

  const cats = ["All", ...CATEGORY_ORDER];
  const filtered = filterCat === "All" ? skills : skills.filter(s => s.category === filterCat);
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const totalSkills = skills.length;
  const avgProf = totalSkills > 0 ? Math.round(skills.reduce((a, s) => a + s.proficiency, 0) / totalSkills) : 0;
  const mastered = skills.filter(s => s.proficiency >= s.target).length;

  function updateSkill(id, patch) { onSave(skills.map(s => s.id === id ? { ...s, ...patch } : s)); }
  function deleteSkill(id) { onSave(skills.filter(s => s.id !== id)); }
  function toggleTopic(skill, topic) {
    const tp = { ...skill.topicProgress, [topic]: !skill.topicProgress[topic] };
    const done = Object.values(tp).filter(Boolean).length;
    const prof = skill.topics.length > 0 ? Math.round((done / skill.topics.length) * 100) : skill.proficiency;
    updateSkill(skill.id, { topicProgress: tp, proficiency: prof, lastStudied: getTodayKey() });
  }

  function saveEditSkill() { updateSkill(editSkill.id, editSkill); setEditSkill(null); }
  function saveNew() {
    if (!newSkill.name.trim()) return;
    onSave([...skills, { ...newSkill, id: "custom-" + Date.now(), topicProgress: {}, lastStudied: null }]);
    setAddNew(false);
    setNewSkill({ name: "", category: "Core CS", color: "#7F77DD", topics: [], notes: "", proficiency: 0, target: 80 });
  }

  return (
    <div>
      {/* Abstract / Detail */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button onClick={() => setView("abstract")} style={{ ...tabBtn, ...(view === "abstract" ? tabActive : {}) }}>Abstract view</button>
        <button onClick={() => setView("detail")} style={{ ...tabBtn, ...(view === "detail" ? tabActive : {}) }}>Detailed view</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[{ v: totalSkills, l: "Total skills" }, { v: mastered, l: "Mastered" }, { v: avgProf + "%", l: "Avg proficiency" }].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {cats.map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: filterCat === c ? "1px solid #1a1a1a" : "1px solid #ddd", background: filterCat === c ? "#1a1a1a" : "transparent", color: filterCat === c ? "#fff" : "#666", cursor: "pointer" }}>{c}</button>)}
        </div>
        <button onClick={() => setAddNew(true)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: "1px solid #1a1a1a", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontWeight: 700 }}>+ Add skill</button>
      </div>

      {/* Abstract: radar-like grid */}
      {view === "abstract" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([cat, skillList]) => (
            <div key={cat}>
              <SLabel mt={0}>{cat}</SLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
                {skillList.map(skill => {
                  const profColor = skill.proficiency >= skill.target ? "#1D9E75" : skill.proficiency >= 50 ? "#7F77DD" : "#D85A30";
                  const topicsDone = skill.topics.filter(t => skill.topicProgress?.[t]).length;
                  return (
                    <div key={skill.id} onClick={() => setView("detail")} style={{ background: "#fff", border: `1px solid ${skill.color}40`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: skill.color, marginTop: 5 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: profColor }}>{skill.proficiency}%</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, marginBottom: 6, lineHeight: 1.3 }}>{skill.name}</div>
                      <PBar value={skill.proficiency} max={100} color={profColor} h={3} />
                      <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>{topicsDone}/{skill.topics.length} topics</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail */}
      {view === "detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([cat, skillList]) => (
            <div key={cat}>
              <SLabel mt={0}>{cat}</SLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {skillList.map(skill => <SkillCard key={skill.id} skill={skill} onEdit={() => setEditSkill({ ...skill })} onDelete={() => deleteSkill(skill.id)} onToggle={topic => toggleTopic(skill, topic)} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {editSkill && <Modal title="Edit skill" onClose={() => setEditSkill(null)}><SkillForm skill={editSkill} onChange={setEditSkill} onSave={saveEditSkill} onClose={() => setEditSkill(null)} /></Modal>}
      {addNew && <Modal title="Add skill" onClose={() => setAddNew(false)}><SkillForm skill={newSkill} onChange={setNewSkill} onSave={saveNew} onClose={() => setAddNew(false)} isNew /></Modal>}
    </div>
  );
}

function SkillCard({ skill, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const topicsDone = skill.topics.filter(t => skill.topicProgress?.[t]).length;
  const profColor = skill.proficiency >= skill.target ? "#1D9E75" : skill.proficiency >= 50 ? "#7F77DD" : "#D85A30";
  return (
    <Card>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 4, borderRadius: 2, background: skill.color, alignSelf: "stretch", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{skill.name}</span>
              <span style={{ fontSize: 10, color: "#bbb", background: "#F7F6F3", padding: "1px 6px", borderRadius: 8 }}>{skill.category}</span>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: profColor }}>{skill.proficiency}%</span>
              <button onClick={onEdit} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", cursor: "pointer" }}>Edit</button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginBottom: 4 }}>
              <span>{topicsDone}/{skill.topics.length} topics done</span>
              <span>Target: {skill.target}%</span>
            </div>
            <PBar value={skill.proficiency} max={100} color={profColor} h={5} />
          </div>
          {skill.lastStudied && <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>Last studied: {skill.lastStudied}</div>}
          {skill.topics.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{ fontSize: 11, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", marginTop: 8, padding: 0, fontWeight: 700 }}>
              {expanded ? "▲ Hide topics" : `▼ ${skill.topics.length} topics`}
            </button>
          )}
          {expanded && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {skill.topics.map(topic => {
                const done = !!skill.topicProgress?.[topic];
                return (
                  <div key={topic} onClick={() => onToggle(topic)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: done ? "#E1F5EE" : "#F7F6F3", borderRadius: 8, cursor: "pointer", userSelect: "none" }}>
                    <CheckBox done={done} size={16} circle />
                    <span style={{ fontSize: 12, color: done ? "#085041" : "#333", textDecoration: done ? "line-through" : "none" }}>{topic}</span>
                  </div>
                );
              })}
            </div>
          )}
          {skill.notes && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setNotesExpanded(e => !e)} style={{ fontSize: 11, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontWeight: 700, marginBottom: 4 }}>
                {notesExpanded ? "▲ Hide notes" : "▼ Show notes"}
              </button>
              {notesExpanded && (
                <div style={{ padding: "8px 12px", background: "#FAEEDA", borderRadius: 8, overflow: "hidden" }}>
                  <MarkdownRenderer text={skill.notes} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SkillForm({ skill, onChange, onSave, onClose }) {
  const [topicInput, setTopicInput] = useState("");
  function addTopic() {
    const t = topicInput.trim();
    if (!t || skill.topics.includes(t)) return;
    onChange(s => ({ ...s, topics: [...s.topics, t] }));
    setTopicInput("");
  }
  return (
    <div>
      {[{ key: "name", label: "Skill name", ph: "e.g. Spring Boot" }, { key: "category", label: "Category", ph: "e.g. Java" }].map(f => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>{f.label}</div>
          <input value={skill[f.key]} onChange={e => onChange(s => ({ ...s, [f.key]: e.target.value }))} placeholder={f.ph} style={inpStyle} />
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>Proficiency: {skill.proficiency}%</div>
        <input type="range" min="0" max="100" value={skill.proficiency} onChange={e => onChange(s => ({ ...s, proficiency: +e.target.value }))} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>Target: {skill.target}%</div>
        <input type="range" min="0" max="100" value={skill.target} onChange={e => onChange(s => ({ ...s, target: +e.target.value }))} style={{ width: "100%" }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>Topics</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTopic()} placeholder="Add topic, press Enter" style={{ ...inpStyle, flex: 1 }} />
          <button onClick={addTopic} style={smallBtn}>Add</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {skill.topics.map(t => (
            <span key={t} style={{ fontSize: 12, background: "#E6F1FB", color: "#185FA5", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
              {t}<span onClick={() => onChange(s => ({ ...s, topics: s.topics.filter(x => x !== t) }))} style={{ cursor: "pointer", fontWeight: 700, color: "#888" }}>×</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>Notes</div>
        <textarea value={skill.notes || ""} onChange={e => onChange(s => ({ ...s, notes: e.target.value }))} placeholder="Resources, blockers, tips..." style={{ ...inpStyle, minHeight: 60, resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={!skill.name.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: skill.name.trim() ? "#1a1a1a" : "#ccc", color: "#fff", fontSize: 14, fontWeight: 700, cursor: skill.name.trim() ? "pointer" : "default" }}>Save</button>
        <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #ddd", background: "transparent", fontSize: 14, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── NOTES VIEW ──────────────────────────────────────────────
// ─── MIGRATION HELPER ──────────────────────────────────────────
function migrateLegacyNotes(notes) {
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
      } else if (lowerText.includes("system design") || lowerText.includes("distributed") || lowerText.includes("database") || lowerText.includes("scaling") || lowerText.includes("cache") || lowerText.includes("load balancing")) {
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

// ─── MARKDOWN RENDERER ────────────────────────────────────────
function MarkdownRenderer({ text }) {
  if (!text) return <div style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>No content yet. Click Edit to add some notes.</div>;

  // Step 1: Split raw text into alternating [text, code, text, code...] segments
  // Code blocks are extracted BEFORE any markdown processing runs, so no regex
  // in the markdown pipeline can ever see or corrupt their content.
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
      extractMap.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3C3489; text-decoration: underline; font-weight: 500;">${text}</a>`);
      return `@@EXTRACT${id}@@`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background: #f1f0ea; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #d85a30;">$1</code>');
    // Headings
    html = html.replace(/^# (.*?)$/gm,   '<h1 style="font-size: 1.6em; margin: 24px 0 12px; font-weight: 800; border-bottom: 1px solid #eaeaea; padding-bottom: 6px; color: #1a1a1a;">$1</h1>');
    html = html.replace(/^## (.*?)$/gm,  '<h2 style="font-size: 1.3em; margin: 20px 0 10px; font-weight: 700; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; color: #333;">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.1em; margin: 16px 0 8px; font-weight: 700; color: #444;">$1</h3>');
    html = html.replace(/^#### (.*?)$/gm,'<h4 style="font-size: 1em; margin: 12px 0 6px; font-weight: 700; color: #555;">$1</h4>');
    // HR
    html = html.replace(/^---$/gm, '<hr style="border: 0; border-top: 1px solid #E6E4E0; margin: 20px 0;" />');
    // Blockquotes
    html = html.replace(/^&gt;[ ]?(.*?)$/gm, '<blockquote style="border-left: 4px solid #7F77DD; padding-left: 12px; margin: 12px 0; color: #666; font-style: italic;">$1</blockquote>');
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
          let th = '<div style="overflow-x:auto;margin:16px 0"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr style="border-bottom:2px solid #E6E4E0">';
          tHeaders.forEach(h => { th += `<th style="padding:8px 12px;font-weight:700;background:#FAF9F6;border:1px solid #E6E4E0">${h}</th>`; });
          th += '</tr></thead><tbody>';
          tRows.forEach(row => { th += '<tr style="border-bottom:1px solid #E6E4E0">'; row.forEach(c => { th += `<td style="padding:8px 12px;border:1px solid #E6E4E0">${c}</td>`; }); th += '</tr>'; });
          th += '</tbody></table></div>';
          tParsed.push(th); inTable = false; tHeaders = []; tRows = [];
        }
        tParsed.push(tLines[i]);
      }
    }
    if (inTable) {
      let th = '<div style="overflow-x:auto;margin:16px 0"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr style="border-bottom:2px solid #E6E4E0">';
      tHeaders.forEach(h => { th += `<th style="padding:8px 12px;font-weight:700;background:#FAF9F6;border:1px solid #E6E4E0">${h}</th>`; });
      th += '</tr></thead><tbody>';
      tRows.forEach(row => { th += '<tr style="border-bottom:1px solid #E6E4E0">'; row.forEach(c => { th += `<td style="padding:8px 12px;border:1px solid #E6E4E0">${c}</td>`; }); th += '</tr>'; });
      th += '</tbody></table></div>';
      tParsed.push(th);
    }
    html = tParsed.join('\n');

    // Bullet lists
    const bLines = html.split('\n'); let inList = false, bParsed = [];
    for (let i = 0; i < bLines.length; i++) {
      const lm = bLines[i].match(/^(\s*)([-*+])[ ]+(.*?)$/);
      if (lm) { if (!inList) { inList = true; bParsed.push('<ul style="margin:8px 0;padding-left:20px;list-style-type:disc">'); } bParsed.push(`<li style="margin:4px 0;line-height:1.6">${lm[3]}</li>`); }
      else { if (inList) { bParsed.push('</ul>'); inList = false; } bParsed.push(bLines[i]); }
    }
    if (inList) bParsed.push('</ul>');
    html = bParsed.join('\n');

    // Numbered lists
    const nLines = html.split('\n'); let inNum = false, nParsed = [];
    for (let i = 0; i < nLines.length; i++) {
      const nm = nLines[i].match(/^(\s*)(\d+)\.[ ]+(.*?)$/);
      if (nm) { if (!inNum) { inNum = true; nParsed.push('<ol style="margin:8px 0;padding-left:20px;list-style-type:decimal">'); } nParsed.push(`<li style="margin:4px 0;line-height:1.6">${nm[3]}</li>`); }
      else { if (inNum) { nParsed.push('</ol>'); inNum = false; } nParsed.push(nLines[i]); }
    }
    if (inNum) nParsed.push('</ol>');
    html = nParsed.join('\n');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      const t = p.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<div') || t.startsWith('<ul') || t.startsWith('<ol') || t.startsWith('<hr') || t.startsWith('<blockquote')) return t;
      return `<p style="line-height:1.7;margin:12px 0 16px">${t.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');

    // Restore Images and Links
    html = html.replace(/@@EXTRACT(\d+)@@/g, (match, id) => extractMap[parseInt(id, 10)]);

    return html;
  }

  // Step 3: Render a code segment with HTML escaping only (no markdown)
  function renderCode(lang, content) {
    const esc = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;overflow-x:auto;margin:16px 0;position:relative">${lang ? `<div style="position:absolute;top:4px;right:10px;font-size:10px;color:#888;text-transform:uppercase;font-weight:700">${lang}</div>` : ''}<pre style="margin:0;white-space:pre"><code>${esc}</code></pre></div>`;
  }

  // Step 4: Map each segment through the right handler and join
  const finalHtml = segments.map(seg => seg.type === 'code' ? renderCode(seg.lang, seg.content) : processText(seg.content)).join('');

  return <div dangerouslySetInnerHTML={{ __html: finalHtml }} style={{ color: "#333", fontSize: "14px", lineHeight: "1.7" }} />;
}

// ─── REDESIGNED NOTES VIEW ────────────────────────────────────
const NOTE_CATEGORIES = ["All Categories", "System Design", "Microservices", "Design Patterns", "Core CS & DSA", "General", "Daily Logs"];

const CATEGORY_COLORS = {
  "System Design": { text: "#d97706", bg: "#fef3c7" },
  "Microservices": { text: "#4f46e5", bg: "#e0e7ff" },
  "Design Patterns": { text: "#0d9488", bg: "#ccfbf1" },
  "Core CS & DSA": { text: "#7c3aed", bg: "#f3e8ff" },
  "General": { text: "#475569", bg: "#f1f5f9" },
  "Daily Logs": { text: "#059669", bg: "#d1fae5" }
};

function NotesView({ data, onUpdate, selectedId, setSelectedId }) {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
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
        const response = await fetch("http://localhost:3001/api/upload", {
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

  // Handle Create Note
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
    setIsEditing(true);
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
      case "Daily Logs": return "📅";
      default: return "📄";
    }
  };

  return (
    <div>
      {/* Pinned thought box (top level container) */}
      <Card style={{ marginBottom: 18, borderLeft: "3px solid #EF9F27", borderRadius: "0 12px 12px 0", background: "#fff", padding: "14px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#854F0B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span>📌 Pinned board</span>
          <span style={{ fontSize: 10, color: "#888", fontWeight: 400, textTransform: "none" }}>(Auto-saves)</span>
        </div>
        <textarea 
          value={pinnedText} 
          onChange={e => handleSavePinned(e.target.value)} 
          placeholder="Pin important thoughts, reminders, formulas, or a goal for the week..." 
          style={{ width: "100%", minHeight: 45, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#333", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} 
        />
      </Card>
      <div style={isExpanded ? {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        display: "flex", background: "#fff", overflow: "hidden"
      } : {
        display: "flex", gap: 20, height: "calc(100vh - 220px)", minHeight: 520, background: "#fff", border: "1px solid #E8E6E0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
      }}>
        
        {/* Left Pane - Sidebar */}
        {!isExpanded && (
        <div style={{ width: 280, borderRight: "1px solid #E8E6E0", display: "flex", flexDirection: "column", background: "#FAF9F6" }}>
          
          {/* Sidebar Header: Categories list */}
          <div style={{ padding: "12px 12px 6px 12px", borderBottom: "1px solid #E8E6E0" }}>
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes & logs..."
              style={{ ...inpStyle, fontSize: 12, padding: "6px 10px", borderRadius: 6, background: "#fff" }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ padding: "8px 8px 4px 8px", display: "flex", flexDirection: "column", gap: 2, borderBottom: "1px solid #E8E6E0" }}>
            {NOTE_CATEGORIES.map(cat => {
              const active = activeCategory === cat;
              return (
                <div 
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
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
                  <span style={{ fontSize: 10, background: active ? "#fff" : "#e2e8f0", padding: "1px 6px", borderRadius: 10, color: "#475569" }}>
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
                    onClick={() => { setSelectedId("journal"); }}
                    style={{
                      background: selectedId === "journal" ? "#fff" : "transparent",
                      border: selectedId === "journal" ? "1px solid #E8E6E0" : "1px solid transparent",
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginBottom: 4,
                      boxShadow: selectedId === "journal" ? "0 2px 8px rgba(0,0,0,0.03)" : "none"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", display: "flex", alignItems: "center", gap: 4 }}>
                      <span>📓</span> Study Journal
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {journalText.substring(0, 45) || "Your ongoing study entries..."}
                    </div>
                  </div>
                )}
                {dailyLogsEntries.map(([dateKey, notes]) => {
                  const active = selectedId === "daily-" + dateKey;
                  const dateObj = new Date(dateKey);
                  const isToday = dateKey === getTodayKey();
                  return (
                    <div 
                      key={dateKey}
                      onClick={() => { setSelectedId("daily-" + dateKey); }}
                      style={{
                        background: active ? "#fff" : "transparent",
                        border: active ? "1px solid #E8E6E0" : "1px solid transparent",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 4,
                        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.03)" : "none"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", display: "flex", justifyContent: "space-between" }}>
                        <span>📅 {dateKey}</span>
                        {isToday && <span style={{ fontSize: 9, background: "#e0f2fe", color: "#0369a1", padding: "1px 4px", borderRadius: 4 }}>Today</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                      onClick={() => { setSelectedId(note.id); }}
                      style={{
                        background: active ? "#fff" : "transparent",
                        border: active ? "1px solid #E8E6E0" : "1px solid transparent",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 6,
                        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical", whiteSpace: "normal" }}>
                          {note.pinned && <span style={{ marginRight: 4 }}>📌</span>}
                          {note.title || "Untitled Note"}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical", whiteSpace: "normal", lineHeight: 1.4 }}>
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
            <div style={{ padding: 12, borderTop: "1px solid #E8E6E0", background: "#f8fafc" }}>
              <button 
                onClick={handleCreateNote}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: 8, 
                  background: "#1e293b", 
                  color: "#fff", 
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
                <span>➕</span> Create New Note
              </button>
            </div>
          )}
        </div>
        )}

        {/* Right Pane - Workspace */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>
          
          {/* Note View Header / Toolbar */}
          {selectedNote || isDailyLog ? (
            <div style={{ padding: "12px 24px", borderBottom: "1px solid #E8E6E0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAF9F6", flexShrink: 0 }}>
              
              {/* Left Side Metadata */}
              <div>
                {isDailyLog ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>📅 Logs: {dailyLogData.date}</span>
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
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
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
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: "none",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    color: "#475569",
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
                    <div style={{ display: "flex", border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
                      <button 
                        onClick={() => setIsEditing(false)} 
                        style={{ 
                          padding: "3px 10px", 
                          fontSize: 11, 
                          fontWeight: 700,
                          border: "none", 
                          background: !isEditing ? "#1e293b" : "transparent", 
                          color: !isEditing ? "#fff" : "#475569", 
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
                          color: isEditing ? "#fff" : "#475569", 
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
                          color: "#ef4444",
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
                <h3 style={{ marginTop: 0, fontSize: 16, borderBottom: "2px solid #E8E6E0", paddingBottom: 8 }}>📝 Logs & Notes</h3>
                {dailyLogData.notes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No log entries recorded for this day.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {dailyLogData.notes.map(n => (
                      <div key={n.id} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                          {n.time === "Migrated" ? "Legacy Note" : new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ fontSize: 16, borderBottom: "2px solid #E8E6E0", paddingBottom: 8, marginTop: 24 }}>🎯 Plan vs Reality Checklist</h3>
                {dailyLogData.plan.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>No planning checklist targets set for this day.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dailyLogData.plan.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: p.achieved ? "#f0fdf4" : "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <CheckBox done={p.achieved} size={16} />
                        <span style={{ fontSize: 13, textDecoration: p.achieved ? "line-through" : "none", color: p.achieved ? "#166534" : "#334155" }}>
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
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Note Title</label>
                        <input 
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          placeholder="Note Title (e.g., Saga Pattern in Microservices)"
                          style={{ ...inpStyle, fontSize: 14, fontWeight: 700, padding: "8px 12px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Category</label>
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
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                        Content (Markdown Supported)
                      </label>
                      <label style={{ 
                        fontSize: 11, fontWeight: 700, color: "#475569", 
                        cursor: "pointer", background: "#f1f5f9", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4
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
                        border: "1px solid #cbd5e1", 
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
                      style={{ padding: "8px 20px", borderRadius: 6, background: "#1e293b", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "transparent", fontSize: 12, color: "#475569", cursor: "pointer" }}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                    <h1 style={{ margin: 0, fontSize: "1.8em", fontWeight: 800, color: "#0f172a" }}>
                      {selectedId === "journal" ? "Study Journal" : selectedNote.title || "Untitled Note"}
                    </h1>
                  </div>
                  
                  {selectedId !== "journal" && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, fontSize: 12, color: "#64748b" }}>
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
                <h3 style={{ margin: 0, color: "#475569" }}>Knowledge Hub</h3>
                <p style={{ fontSize: 13, maxWidth: 300, margin: "8px 0 0 0", lineHeight: 1.5 }}>
                  Select a note from the left sidebar to read or edit, or create a new markdown note.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── HISTORY VIEW ────────────────────────────────────────────
function HistoryView({ data, allTasks }) {
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
          <div key={i} style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>{totalDays}-day heatmap</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {Array.from({ length: totalDays }, (_, i) => {
            const key = getDateKey(startDate, i + 1);
            const d = data.days?.[key];
            const done = d ? Object.values(d.tasks || {}).filter(Boolean).length : 0;
            const isFuture = i + 1 > dayNumber;
            const isToday = key === todayKey;
            let bg = "#F0EEE8";
            if (!isFuture && done > 0) { const r = done / allTasks.length; bg = r >= 1 ? "#1D9E75" : r >= 0.5 ? "#5DCAA5" : "#9FE1CB"; }
            if (isToday) bg = "#7F77DD";
            return <div key={i} title={`${formatDate(key)} (Day ${i + 1}): ${done} tasks`} style={{ width: 14, height: 14, borderRadius: 3, background: isFuture ? "#F7F6F3" : bg, border: isToday ? "2px solid #534AB7" : "none", opacity: isFuture ? 0.3 : 1 }} />;
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 10, color: "#aaa" }}>
          {[["#1D9E75", "Full"], ["#5DCAA5", "Partial"], ["#7F77DD", "Today"], ["#F0EEE8", "Missed"]].map(([c, l]) => (
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
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, border: filter === f ? "1px solid #1a1a1a" : "1px solid #ddd", background: filter === f ? "#1a1a1a" : "transparent", color: filter === f ? "#fff" : "#666", cursor: "pointer" }}>{l}</button>
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
                  <span style={{ fontSize: 12, color: "#888" }}>{wDone} full · {wPartial} partial · {wTotal - wDone - wPartial} missed</span>
                </div>
                <PBar value={wPct} max={100} color={wPct >= 80 ? "#1D9E75" : wPct >= 40 ? "#7F77DD" : "#D85A30"} h={6} />
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {weekDays.map(d => (
                    <div key={d.day} style={{ flex: 1, height: 24, borderRadius: 5, background: d.done === d.total ? "#1D9E75" : d.done > 0 ? "#5DCAA5" : "#F0EEE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: d.done > 0 ? "#fff" : "#bbb" }}>{d.day}</div>
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
            <div style={{ textAlign: "center", color: "#aaa", fontSize: 13, padding: "24px 0" }}>No history yet.</div>
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
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.done === d.total ? "#1D9E75" : d.done > 0 ? "#7F77DD" : "#ddd" }}>{d.done}/{d.total}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}><PBar value={d.done} max={d.total} color={d.done === d.total ? "#1D9E75" : "#7F77DD"} h={4} /></div>
                {dNotes.length > 0 && (
                  <div style={{ fontSize: 12, color: "#555", marginTop: 8, borderTop: "1px solid #F7F6F3", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {dNotes.map(n => (
                      <div key={n.id} style={{ display: "flex", gap: 8 }}>
                        <span style={{ color: "#aaa", fontSize: 10, alignSelf: "center" }}>•</span>
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

// ─── TASKS VIEW ───────────────────────────────────────────────
function TasksView({ customTasks, onSave, onReset }) {
  const [editTask, setEditTask] = useState(null);
  const [showReset, setShowReset] = useState(false);
  function saveTask(task) {
    if (task.id === "__new__") onSave([...customTasks, { ...task, id: "custom-" + Date.now() }]);
    else onSave(customTasks.map(t => t.id === task.id ? task : t));
    setEditTask(null);
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SLabel mt={0}>Daily practice tasks</SLabel>
        <button onClick={() => setEditTask({ id: "__new__", label: "", category: "", duration: "", detail: "" })} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: "1px solid #1a1a1a", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontWeight: 700 }}>+ Add task</button>
      </div>
      <SLabel mt={0}>Default (always on)</SLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {DEFAULT_TASKS.map(t => (
          <Card key={t.id} style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{t.detail}</div></div>
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: 10, flexShrink: 0 }}>{t.duration}</span>
            </div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 5, fontWeight: 700, textTransform: "uppercase" }}>{t.category}</div>
          </Card>
        ))}
      </div>
      {customTasks.length > 0 && (
        <>
          <SLabel>Custom tasks</SLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {customTasks.map(t => (
              <Card key={t.id} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{t.detail}</div></div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 10 }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{t.duration}</span>
                    <button onClick={() => setEditTask(t)} style={smallBtn}>Edit</button>
                    <button onClick={() => onSave(customTasks.filter(x => x.id !== t.id))} style={{ ...smallBtn, borderColor: "#fcc", color: "#c0392b" }}>Del</button>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 5, fontWeight: 700, textTransform: "uppercase" }}>{t.category}</div>
              </Card>
            ))}
          </div>
        </>
      )}
      <div style={{ marginTop: 24, borderTop: "1px solid #F0EEE8", paddingTop: 16 }}>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} style={{ fontSize: 12, color: "#c0392b", background: "transparent", border: "1px solid #fcc", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>Reset 60-day progress</button>
        ) : (
          <Card style={{ background: "#FEF2F2", borderColor: "#fcc" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c0392b", marginBottom: 6 }}>Reset all progress?</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Clears daily completions and notes. Skills and custom tasks are kept.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onReset(); setShowReset(false); }} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Yes, reset</button>
              <button onClick={() => setShowReset(false)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", cursor: "pointer" }}>Cancel</button>
            </div>
          </Card>
        )}
      </div>
      {editTask && (
        <Modal title={editTask.id === "__new__" ? "Add task" : "Edit task"} onClose={() => setEditTask(null)}>
          <div>
            {[{ k: "label", l: "Task name", p: "e.g. Read Kleppmann chapter" }, { k: "category", l: "Category", p: "e.g. System Design" }, { k: "duration", l: "Duration", p: "e.g. 30 min" }].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>{f.l}</div>
                <input value={editTask[f.k]} onChange={e => setEditTask(t => ({ ...t, [f.k]: e.target.value }))} placeholder={f.p} style={inpStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>Detail</div>
              <textarea value={editTask.detail} onChange={e => setEditTask(t => ({ ...t, detail: e.target.value }))} placeholder="What exactly to do..." style={{ ...inpStyle, minHeight: 60, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => saveTask(editTask)} disabled={!editTask.label.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: editTask.label.trim() ? "#1a1a1a" : "#ccc", color: "#fff", fontSize: 14, fontWeight: 700, cursor: editTask.label.trim() ? "pointer" : "default" }}>Save</button>
              <button onClick={() => setEditTask(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #ddd", background: "transparent", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ fontSize: 22, background: "transparent", border: "none", cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Shared style tokens ──────────────────────────────────────
const inpStyle = { width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" };
const smallBtn = { fontSize: 11, padding: "2px 7px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", cursor: "pointer", color: "#555" };
const navBtn = { fontSize: 14, padding: "2px 8px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", cursor: "pointer", color: "#555", lineHeight: 1.4 };
const navBtnFull = { flex: 1, padding: "8px", borderRadius: 10, border: "1px solid #ddd", background: "transparent", fontSize: 13, cursor: "pointer", color: "#555" };
const tabBtn = { fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1px solid #ddd", background: "transparent", color: "#666", cursor: "pointer" };
const tabActive = { border: "1px solid #1a1a1a", background: "#1a1a1a", color: "#fff", fontWeight: 700 };

const VIEWS = [
  { id: "today", label: "Today" },
  { id: "schedule", label: "Schedule" },
  { id: "plan", label: "6-Month Plan" },
  { id: "skills", label: "Skills" },
  { id: "history", label: "History" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes" },
];

function SettingsModal({ data, onSave, onClose }) {
  const [start, setStart] = useState(data.settings.startDate);
  const [days, setDays] = useState(data.settings.totalDays);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <Card style={{ width: 340, padding: 24 }}>
        <h3 style={{ margin: "0 0 16px 0" }}>App Settings</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Program Start Date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inpStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Total Duration (Days)</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} style={inpStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onSave({ startDate: start, totalDays: days })} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#eee", color: "#666", border: "none", cursor: "pointer" }}>Cancel</button>
        </div>
      </Card>
    </div>
  );
}

function GeneralNotesSidebar({ data = [], onUpdate }) {
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
    <div style={{ width: 260, borderRight: "1px solid #E6E4E0", background: "#fbfaf8", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #E6E4E0" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>General Notes</h3>
      </div>
      <div style={{ padding: 12, borderBottom: "1px solid #E6E4E0" }}>
        <textarea 
          value={txt} 
          onChange={e => setTxt(e.target.value)} 
          placeholder={editingNoteId ? "Edit your note..." : "Quick note... (Press save)"} 
          style={{ ...inpStyle, height: 80, resize: "none", marginBottom: 8 }} 
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button 
            onClick={handleSaveOrUpdate} 
            style={{ flex: 1, padding: "6px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
          >
            {editingNoteId ? "Update" : "Save Note"}
          </button>
          {editingNoteId !== null && (
            <button 
              onClick={cancelEdit} 
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "transparent", fontSize: 12, cursor: "pointer", color: "#475569" }}
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
                background: "#fff", 
                padding: 10, 
                borderRadius: 8, 
                border: isExpanded ? "1.5px solid #1a1a1a" : "1px solid #E6E4E0", 
                boxShadow: isExpanded ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: "#1e293b" }}>
                {n.pinned && <span style={{ marginRight: 4 }}>📌</span>}
                {n.title || "Quick Note"}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>
                {n.category || "General"}
              </div>
              <div style={{ 
                fontSize: 11, 
                lineHeight: 1.4, 
                color: "#475569", 
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
              <div style={{ fontSize: 9, color: "#aaa", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    style={{ cursor: "pointer", color: "#ef4444", fontWeight: 700 }}
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

function DailyNotesSection({ notes = [], onUpdate }) {
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
        <button onClick={addNote} style={{ padding: "0 15px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 12, cursor: "pointer" }}>Submit</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.length === 0 && <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>No notes for today yet.</div>}
        {notes.map(n => (
          <div key={n.id} style={{ background: "#FBFBFA", padding: "10px 12px", borderRadius: 10, border: "1px solid #E6E4E0" }}>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.text}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginTop: 6 }}>
              <span>{n.time === "Migrated" ? "Legacy" : formatTime(n.time)}</span>
              <span onClick={() => deleteNote(n.id)} style={{ color: "#D85A30", cursor: "pointer" }}>Remove</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyPlanSection({ plan = [], onUpdate }) {
  const [txt, setTxt] = useState("");
  const add = () => { if (!txt.trim()) return; onUpdate([...plan, { id: Date.now(), text: txt, achieved: false }]); setTxt(""); };
  const toggle = (id) => onUpdate(plan.map(p => p.id === id ? { ...p, achieved: !p.achieved } : p));
  const remove = (id) => onUpdate(plan.filter(p => p.id !== id));
  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: 13, marginBottom: 12 }}>Plan vs Reality</h4>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="What do you plan to achieve?" style={{ ...inpStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && add()} />
        <button onClick={add} style={{ padding: "0 15px", borderRadius: 8, background: "#1a1a1a", color: "#fff", border: "none", fontSize: 12, cursor: "pointer" }}>Plan It</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: p.achieved ? "#f0fdf4" : "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #E6E4E0" }}>
            <input type="checkbox" checked={p.achieved} onChange={() => toggle(p.id)} style={{ cursor: "pointer" }} />
            <span style={{ flex: 1, fontSize: 13, textDecoration: p.achieved ? "line-through" : "none", color: p.achieved ? "#115e59" : "#333" }}>{p.text}</span>
            <span onClick={() => remove(p.id)} style={{ color: "#D85A30", cursor: "pointer", fontSize: 14 }}>×</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleView({ data, onUpdatePlanning }) {
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
          <Card key={d.key} style={{ padding: 16, border: d.key === todayKey ? "2px solid #1a1a1a" : "1px solid #E6E4E0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{d.label}</span>
              {plan.length > 0 && <span style={{ fontSize: 12, color: pct === 100 ? "#1D9E75" : "#666" }}>{pct}% complete</span>}
            </div>
            <DailyPlanSection plan={plan} onUpdate={(newPlan) => onUpdatePlanning(d.key, newPlan)} />
          </Card>
        );
      })}
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────
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

  if (!data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 14, color: "#888" }}>Loading…</div>;

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F6F3", color: "#333" }}>
      {showSettings && <SettingsModal data={data} onSave={(s) => { updateSettings(s); setShowSettings(false); }} onClose={() => setShowSettings(false)} />}

      {sidebarOpen && (
        <GeneralNotesSidebar 
          data={data.quickNotes || []} 
          onUpdate={updateQuickNotes} 
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E0", padding: "10px 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Toggle Sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" }}>Architect Tracker</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>Day {dayNumber}/{totalDays} · {streak > 0 ? `🔥 ${streak} streak` : "Build your streak"} {saving ? "· saving…" : ""}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {VIEWS.map(v => (
                  <button key={v.id} onClick={() => setView(v.id)} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, border: view === v.id ? "1px solid #1a1a1a" : "1px solid #E8E6E0", background: view === v.id ? "#1a1a1a" : "transparent", color: view === v.id ? "#fff" : "#555", cursor: "pointer", fontWeight: view === v.id ? 700 : 400 }}>{v.label}</button>
                ))}
              </nav>
              <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
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
              <div key={i} style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.lbl}</div>
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
