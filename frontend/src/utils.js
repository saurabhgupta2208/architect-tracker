import { API_URL as API } from "./constants";

// ─── Motivational quotes ──────────────────────────────────────
export const QUOTES = [
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
export const PHASES = {
  Foundation: { color: "#5DCAA5", bg: "#E1F5EE", text: "#085041", days: "Days 1–20" },
  Scaling: { color: "#7F77DD", bg: "#EEEDFE", text: "#3C3489", days: "Days 21–40" },
  "Interview Ready": { color: "#D85A30", bg: "#FAECE7", text: "#712B13", days: "Days 41–60" },
};

export const PHASE_GUIDANCE = {
  Foundation: { focus: "DSA + Basics", tips: ["Master Trees, Graphs, Sliding Window, Heap, LRU", "CAP theorem, consistency, replication, sharding", "Microservices: Saga, API Gateway, Circuit Breaker"] },
  Scaling: { focus: "DSA + Design", tips: ["6–8 end-to-end system designs with API + DB schema", "Kubernetes basics, load balancing, multi-region", "P95/P99 latency, thread pools, backpressure, GC basics"] },
  "Interview Ready": { focus: "Mocks + Advanced", tips: ["CQRS, event sourcing, time-series storage", "SLA/SLO, disaster recovery, failover design", "3 System Design + 3 DSA + 2 Behavioral mocks"] },
};

// 60-day curriculum: each day maps to a phase, week, and suggested focus
export const DAY_CURRICULUM = Array.from({ length: 60 }, (_, i) => {
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

export const DEFAULT_TASKS = [
  { id: "sys-design", category: "System Design", label: "System design study", duration: "60 min", detail: "Practice one end-to-end design — URL shortener, rate limiter, analytics, chat, etc." },
  { id: "dsa", category: "DSA", label: "DSA problem solving", duration: "45 min", detail: "LeetCode medium/hard — Trees, Graphs, Sliding Window, Heap, DP" },
  { id: "revision", category: "Revision", label: "Revision & notes", duration: "20 min", detail: "Review yesterday's notes. Consolidate patterns and key trade-offs." },
  { id: "speak", category: "Communication", label: "Speak design aloud", duration: "15 min", detail: "Explain a system design out loud. Framework: Clarify → HLD → Deep Dive → Trade-offs → Risks." },
];

export const MINDSET_CHECKS = [
  { id: "scale", label: "Thought about scale?" },
  { id: "tradeoff", label: "Analysed trade-offs?" },
  { id: "comm", label: "Practised communication?" },
  { id: "learn", label: "Learned something new?" },
];

export const BADGE_COLORS = {
  cloud: { bg: "var(--badge-cloud-bg)", text: "var(--badge-cloud-text)" },
  depth: { bg: "var(--badge-depth-bg)", text: "var(--badge-depth-text)" },
  visibility: { bg: "var(--badge-vis-bg)", text: "var(--badge-vis-text)" },
  leadership: { bg: "var(--badge-lead-bg)", text: "var(--badge-lead-text)" },
};

export const CATEGORY_ORDER = ["Core CS", "Design", "Java", "Architecture", "Data", "Cloud & Infra", "Messaging & Cache"];

// ─── Six-month plan data ──────────────────────────────────────
export const SIX_MONTH_PLAN = [
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

export const VIEWS = [
  { id: "today", label: "Today" },
  { id: "schedule", label: "Schedule" },
  { id: "skills", label: "Skills" },
  { id: "plan", label: "6-Month Plan" },
  { id: "history", label: "History" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes" },
];

export const inpStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  outline: "none",
  fontSize: 13,
  background: "var(--bg-app)",
  color: "var(--text-main)",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export const CATEGORY_COLORS = {
  "Core CS": { text: "var(--cat-core-text)", bg: "var(--cat-core-bg)" },
  "Core CS & DSA": { text: "var(--cat-core-text)", bg: "var(--cat-core-bg)" },
  "Design": { text: "var(--cat-design-text)", bg: "var(--cat-design-bg)" },
  "System Design": { text: "var(--cat-design-text)", bg: "var(--cat-design-bg)" },
  "Design Patterns": { text: "var(--cat-dp-text)", bg: "var(--cat-dp-bg)" },
  "Java": { text: "var(--cat-java-text)", bg: "var(--cat-java-bg)" },
  "JAVA": { text: "var(--cat-java-text)", bg: "var(--cat-java-bg)" },
  "Architecture": { text: "var(--cat-arch-text)", bg: "var(--cat-arch-bg)" },
  "Microservices": { text: "var(--cat-micro-text)", bg: "var(--cat-micro-bg)" },
  "Data": { text: "var(--cat-data-text)", bg: "var(--cat-data-bg)" },
  "Cloud & Infra": { text: "var(--cat-cloud-text)", bg: "var(--cat-cloud-bg)" },
  "Messaging & Cache": { text: "var(--cat-msg-text)", bg: "var(--cat-msg-bg)" },
  "General": { text: "var(--cat-gen-text)", bg: "var(--cat-gen-bg)" },
  "Daily Logs": { text: "var(--cat-daily-text)", bg: "var(--cat-daily-bg)" },
};

export const NOTE_CATEGORIES = [
  "All Categories",
  "System Design",
  "Microservices",
  "Design Patterns",
  "Core CS & DSA",
  "JAVA",
  "Messaging & Cache",
  "General",
  "Daily Logs",
];

// ─── Helpers ──────────────────────────────────────────────────
export function getTodayKey() { return new Date().toISOString().split("T")[0]; }

export function getDateKey(startDate, dayNum) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toISOString().split("T")[0];
}

export function formatDate(dateKey) {
  if (!dateKey) return "";
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(dateKey));
}

export function formatFullDate(dateKey) {
  if (!dateKey) return "";
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateKey));
}

export function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

export function getPhaseForDay(day, totalDays = 60) {
  const p1 = Math.floor(totalDays / 3);
  const p2 = p1 * 2;
  return day <= p1 ? "Foundation" : day <= p2 ? "Scaling" : "Interview Ready";
}

export function getDayNumber(startDate) {
  const s = new Date(startDate); const t = new Date();
  s.setHours(0, 0, 0, 0); t.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((t - s) / 86400000) + 1);
}

export function calcStreak(days) {
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

export function getPhaseAwareTasks(dayNum, phase) {
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

export function getDailyQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

// ─── API calls ────────────────────────────────────────────────
export async function apiGet(path) {
  try { const r = await fetch(API + path); return await r.json(); } catch { return null; }
}

export async function apiPut(path, body) {
  try { await fetch(API + path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); } catch { }
}
