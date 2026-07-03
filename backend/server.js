const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "tracker.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

// Ensure data dirs exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

app.use("/api/images", express.static(IMAGES_DIR));
//app.use(express.json());

app.use(cors());

app.use(express.json({
    limit: "100mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "100mb"
}));

// Serve frontend build
const FRONTEND_BUILD = path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(FRONTEND_BUILD)) {
  app.use(express.static(FRONTEND_BUILD));
}

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      return mergeWithDefaults(saved);
    }
  } catch (e) {
    console.error("Error reading data:", e.message);
  }
  return getDefaultData();
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error writing data:", e.message);
    return false;
  }
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDefaultData() {
  return {
    settings: {
      startDate: getTodayKey(),
      totalDays: 180
    },
    days: {},
    customTasks: [],
    dailyNotes: {},    // { [dateKey]: [{ id, text, time }] }
    dailyPlanning: {}, // { [dateKey]: [{ id, text, achieved }] }
    generalNotes: [],  // [{ id, text, time }]
    quickNotes: [],    // [{ id, title, text, category, time, pinned }]
    journal: "",
    pinnedNote: "",
    skills: getDefaultSkills(),
    sixMonthPlan: getDefaultSixMonthPlan()
  };
}

// Merge saved data with defaults so new fields appear on upgrade
// without wiping existing user data
function mergeWithDefaults(saved) {
  const defaults = getDefaultData();
  const merged = { ...defaults, ...saved };

  // Migrate old startDate to settings
  if (saved.startDate && !saved.settings) {
    merged.settings = { ...defaults.settings, startDate: saved.startDate };
  }

  // Migrate old notes {[dateKey]: string} to dailyNotes {[dateKey]: [{id, text, time}]}
  if (saved.notes && (!saved.dailyNotes || Object.keys(saved.dailyNotes).length === 0)) {
    merged.dailyNotes = {};
    Object.entries(saved.notes).forEach(([date, text]) => {
      if (text && text.trim()) {
        merged.dailyNotes[date] = [{ id: "migrated-" + Date.now(), text, time: "Migrated" }];
      }
    });
  }

  // Always keep saved skills/plan if they exist
  if (!saved.skills || saved.skills.length === 0) merged.skills = defaults.skills;
  if (!saved.sixMonthPlan || saved.sixMonthPlan.length === 0) {
    merged.sixMonthPlan = defaults.sixMonthPlan;
  } else {
    // Migrate old flat-tasks plan shape ({ tasks: [] }) to weeks-based shape ({ weeks: [] })
    const hasOldShape = saved.sixMonthPlan.some(m => Array.isArray(m.tasks) && !m.weeks);
    if (hasOldShape) merged.sixMonthPlan = defaults.sixMonthPlan;
  }
  // Ensure new top-level fields exist
  if (merged.journal === undefined) merged.journal = "";
  if (merged.pinnedNote === undefined) merged.pinnedNote = "";
  if (merged.generalNotes === undefined) merged.generalNotes = [];
  if (merged.quickNotes === undefined) merged.quickNotes = [];
  if (merged.dailyPlanning === undefined) merged.dailyPlanning = {};

  return merged;
}

function getDefaultSkills() {
  const skillDefs = [
    // DSA & Algorithms
    { id: "dsa", name: "DSA", category: "Core CS", color: "#7F77DD", topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Sliding Window", "Heap / Priority Queue", "LRU Cache", "Recursion & Backtracking"] },
    { id: "lld", name: "LLD", category: "Design", color: "#D85A30", topics: ["Class diagrams", "SOLID application", "Design patterns in code", "Object modelling", "UML basics"] },
    { id: "system-design", name: "System Design", category: "Design", color: "#D85A30", topics: ["URL Shortener", "Rate Limiter", "Chat System", "Analytics Pipeline", "News Feed", "Search Autocomplete", "Distributed Cache"] },
    { id: "design-patterns", name: "Design Patterns", category: "Design", color: "#D85A30", topics: ["Singleton", "Factory", "Builder", "Observer", "Strategy", "Decorator", "Proxy", "Command"] },
    // Java
    { id: "java-core", name: "Java Core", category: "Java", color: "#1D9E75", topics: ["Collections internals", "Generics", "Exception handling", "JVM memory model", "Classloading", "Reflection", "Serialization"] },
    { id: "java21", name: "Java 21 Features", category: "Java", color: "#1D9E75", topics: ["Virtual Threads (Project Loom)", "Pattern Matching", "Record types", "Sealed classes", "Text blocks", "Switch expressions", "Structured Concurrency"] },
    { id: "threads", name: "Threads & Concurrency", category: "Java", color: "#1D9E75", topics: ["Thread lifecycle", "synchronized / volatile", "ExecutorService", "CompletableFuture", "ReentrantLock", "CountDownLatch", "Deadlock prevention"] },
    { id: "gc", name: "Garbage Collection", category: "Java", color: "#1D9E75", topics: ["GC algorithms (G1, ZGC, Shenandoah)", "Heap regions", "GC tuning flags", "Memory leaks", "GC logs analysis", "Metaspace"] },
    // Architecture & Principles
    { id: "solid", name: "SOLID Principles", category: "Architecture", color: "#BA7517", topics: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion"] },
    { id: "microservice", name: "Microservices", category: "Architecture", color: "#BA7517", topics: ["Service decomposition", "API Gateway", "Service mesh", "Event-driven arch", "Strangler fig pattern", "Sidecar pattern"] },
    { id: "ms-patterns", name: "Microservice Patterns", category: "Architecture", color: "#BA7517", topics: ["Saga pattern", "Circuit Breaker", "CQRS", "Event Sourcing", "Outbox pattern", "Bulkhead", "Retry & Timeout"] },
    // Data
    { id: "query", name: "SQL / Query", category: "Data", color: "#185FA5", topics: ["Query optimisation", "Indexes (B-tree, Hash)", "Joins & subqueries", "Window functions", "Execution plans", "Partitioning", "Transactions & isolation"] },
    { id: "hibernate", name: "Hibernate / JPA", category: "Data", color: "#185FA5", topics: ["Entity lifecycle", "Lazy vs Eager loading", "N+1 problem", "Caching (L1/L2)", "HQL vs Criteria API", "Cascade types"] },
    // Infrastructure
    { id: "aws", name: "AWS", category: "Cloud & Infra", color: "#854F0B", topics: ["EC2 / ECS / EKS", "RDS / DynamoDB", "S3 / CloudFront", "SQS / SNS", "Lambda", "VPC & Security Groups", "CloudWatch / X-Ray"] },
    { id: "docker", name: "Docker", category: "Cloud & Infra", color: "#854F0B", topics: ["Dockerfile best practices", "Multi-stage builds", "Networking", "Volumes", "docker-compose", "Image optimisation"] },
    { id: "kubernetes", name: "Kubernetes", category: "Cloud & Infra", color: "#854F0B", topics: ["Pods, Deployments, Services", "ConfigMap & Secrets", "Ingress", "HPA / VPA", "Resource limits", "Helm basics", "Rolling updates"] },
    // Messaging & Caching
    { id: "kafka", name: "Kafka", category: "Messaging & Cache", color: "#0F6E56", topics: ["Topics, Partitions, Offsets", "Producers & Consumers", "Consumer groups", "Exactly-once semantics", "Compaction", "Kafka Streams", "Schema Registry"] },
    { id: "redis", name: "Redis", category: "Messaging & Cache", color: "#0F6E56", topics: ["Data structures", "Pub/Sub", "TTL & eviction", "Persistence (RDB/AOF)", "Cluster mode", "Lua scripting", "Redis as queue"] },
    { id: "memcached", name: "Memcached", category: "Messaging & Cache", color: "#0F6E56", topics: ["Architecture vs Redis", "Consistent hashing", "Slab allocator", "Eviction policies", "Use cases"] },
    { id: "elasticsearch", name: "Elasticsearch", category: "Messaging & Cache", color: "#0F6E56", topics: ["Inverted index", "Mapping & analyzers", "Query DSL", "Aggregations", "Shards & replicas", "Index lifecycle", "ELK stack"] },
  ];

  return skillDefs.map(s => ({
    ...s,
    proficiency: 0,
    target: 80,
    topicProgress: {},
    notes: "",
    lastStudied: null
  }));
}

function getDefaultSixMonthPlan() {
  return [
    {
      month: 1, title: "Cloud foundation",
      focus: "Get hands dirty with AWS. Rebuild one existing project on AWS. Replace Prometheus with CloudWatch.",
      milestone: "Deploy Spring Boot microservice on EKS with RDS, behind ALB. Push metrics to CloudWatch. GitHub repo live.",
      weeks: [
        {
          week: 1, title: "AWS account + Well-Architected labs", goal: "Set up AWS, complete compute & networking labs",
          tasks: [
            { id: "m1w1t1", title: "Create AWS free tier account", detail: "Sign up at aws.amazon.com/free — t2.micro is always free", badge: "cloud", done: false },
            { id: "m1w1t2", title: "Complete AWS Well-Architected labs — compute module", detail: "Focus on EC2, ECS basics", badge: "cloud", done: false },
            { id: "m1w1t3", title: "Complete AWS Well-Architected labs — networking module", detail: "VPC, subnets, security groups, ALB concepts", badge: "cloud", done: false },
            { id: "m1w1t4", title: "Create GitHub profile with pinned repos + README", detail: "Include CDC project description with code samples", badge: "visibility", done: false },
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
            { id: "m1w3t2", title: "Define 3 SLOs: availability, p99 latency, error rate", detail: "Create CloudWatch Alarms + Dashboard", badge: "depth", done: false },
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
            { id: "m2w1t1", title: "Read SRE book chapters 1–6 (Google SRE book — free online)", detail: "Focus: SLOs, SLIs, error budgets. sre.google/sre-book", badge: "depth", done: false },
            { id: "m2w1t2", title: "Read SRE book chapters 13–17 (on-call & incident management)", detail: "Especially chapter 14: Managing Incidents", badge: "depth", done: false },
            { id: "m2w1t3", title: "Document SLIs and SLOs for TJ5600 analytics server", detail: "Availability 99.9%, p99 < 200ms, error rate < 0.1%", badge: "leadership", done: false },
          ]
        },
        {
          week: 2, title: "Fault tolerance patterns", goal: "Implement circuit breaker + retry in one service",
          tasks: [
            { id: "m2w2t1", title: "Add Resilience4j circuit breaker to one microservice", detail: "Configure failure rate threshold, slow call threshold, half-open state", badge: "depth", done: false },
            { id: "m2w2t2", title: "Add retry with exponential backoff + jitter", detail: "Max 3 retries, base 100ms, max 2s. Document failure modes handled", badge: "depth", done: false },
            { id: "m2w2t3", title: "Write runbook for the circuit breaker: when it trips, how to recover", detail: "1 page max. Store in team Confluence or Notion", badge: "leadership", done: false },
          ]
        },
        {
          week: 3, title: "ADR writing", goal: "Write and share one Architecture Decision Record",
          tasks: [
            { id: "m2w3t1", title: "Write ADR for monolith-to-microservices migration decision", detail: "Nygard's template: Title → Status → Context → Decision → Consequences", badge: "leadership", done: false },
            { id: "m2w3t2", title: "Share ADR with team for review — get at least 2 comments", detail: "Post in Confluence. Ask: 'What would you have decided differently?'", badge: "leadership", done: false },
            { id: "m2w3t3", title: "Write second ADR for a current or upcoming decision", detail: "Service discovery approach, DB choice, caching strategy", badge: "leadership", done: false },
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
      focus: "Interview prep month. You have the raw experience — now build the vocabulary and structured thinking to present it clearly.",
      milestone: "Complete 8 system design practice sessions. Write up TJ5600 as a case study. Book AWS SAA exam.",
      weeks: [
        {
          week: 1, title: "Read DDIA", goal: "Complete Kleppmann's 'Designing Data-Intensive Applications'",
          tasks: [
            { id: "m3w1t1", title: "Read DDIA Part I: Foundations of data systems (chapters 1–3)", detail: "Reliability, scalability, maintainability. Data models, storage engines", badge: "depth", done: false },
            { id: "m3w1t2", title: "Read DDIA Part II: Distributed data (chapters 5–9)", detail: "Replication, partitioning, transactions", badge: "depth", done: false },
            { id: "m3w1t3", title: "Read DDIA Part III: Derived data (chapters 10–12)", detail: "Batch processing, stream processing, future of data systems", badge: "depth", done: false },
          ]
        },
        {
          week: 2, title: "System design practice ×4", goal: "Practice 4 designs with full write-up",
          tasks: [
            { id: "m3w2t1", title: "Design: URL shortener + rate limiter (60 min each on Excalidraw)", detail: "API design, DB schema, caching, scaling, failure modes, capacity estimate", badge: "depth", done: false },
            { id: "m3w2t2", title: "Design: Twitter feed + notification system", detail: "Fan-out problem, push vs pull, hot celebrity problem", badge: "depth", done: false },
            { id: "m3w2t3", title: "Write up TJ5600 as a full system design case study", detail: "Capacity estimates → HLD → Deep dive → Trade-offs → Lessons", badge: "visibility", done: false },
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
            { id: "m3w4t2", title: "Document 5 cross-team decisions you made or influenced", detail: "RFCs written, standards others adopted, design reviews you ran for other teams", badge: "leadership", done: false },
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
            { id: "m4w1t1", title: "Complete Stephane Maarek AWS SAA course (Udemy)", detail: "Focus: EC2, S3, RDS, VPC, IAM, ECS/EKS, CloudFront, Route 53", badge: "cloud", done: false },
            { id: "m4w1t2", title: "Take first Tutorials Dojo practice test — note weak areas", detail: "Target 60%+ on first attempt. Create a weak-area cheat sheet", badge: "cloud", done: false },
            { id: "m4w1t3", title: "Implement AWS Secrets Manager for all credentials in your project", detail: "Remove every hardcoded config. Document the secrets rotation strategy", badge: "cloud", done: false },
          ]
        },
        {
          week: 2, title: "Security architecture", goal: "Add JWT service-to-service auth",
          tasks: [
            { id: "m4w2t1", title: "Add JWT-based service-to-service authentication between 2 microservices", detail: "Use Spring Security + JWKS endpoint. Document the trust model", badge: "depth", done: false },
            { id: "m4w2t2", title: "Write up service auth as a security design pattern doc", detail: "1-pager: problem → solution → trade-offs vs API keys, mTLS, OAuth client credentials", badge: "visibility", done: false },
            { id: "m4w2t3", title: "Review OWASP Top 10 for APIs — check your services against it", detail: "owasp.org/API-Security. Document findings and any gaps", badge: "depth", done: false },
          ]
        },
        {
          week: 3, title: "AWS SAA practice tests", goal: "Score 80%+ on 3 practice tests",
          tasks: [
            { id: "m4w3t1", title: "Complete 3 more Tutorials Dojo practice tests — target 80%+", detail: "Review every wrong answer. Focus on scenario-based architecture trade-offs", badge: "cloud", done: false },
            { id: "m4w3t2", title: "Reach out to 2 senior engineers at Flipkart / Razorpay / Atlassian", detail: "LinkedIn DM. Ask about Staff architect interview process — not job openings", badge: "leadership", done: false },
          ]
        },
        {
          week: 4, title: "AWS SAA exam + blog post #3", goal: "Pass the exam. Publish lessons-from-migration post.",
          tasks: [
            { id: "m4w4t1", title: "Take and pass AWS SAA-C03 exam", detail: "You're ready if scoring 80%+ on practice tests. Trust the prep.", badge: "cloud", done: false },
            { id: "m4w4t2", title: "Write blog post #3: 'Lessons from migrating a monolith to microservices'", detail: "Be honest about failures. Engineers trust posts that share what went wrong.", badge: "visibility", done: false },
          ]
        },
      ]
    },
    {
      month: 5, title: "Leadership footprint",
      focus: "Stop being the best engineer in the room. Start being the one who changes how the room works.",
      milestone: "Cross-team design guild running. RFC adopted outside your team. Open-source contribution merged.",
      weeks: [
        {
          week: 1, title: "Launch design guild", goal: "Propose and run first cross-team design session",
          tasks: [
            { id: "m5w1t1", title: "Draft 1-page proposal for a bi-weekly architecture design guild", detail: "Name, purpose, format (60 min), how to submit designs, who it's open to", badge: "leadership", done: false },
            { id: "m5w1t2", title: "Send Slack outreach to 5–8 engineers across 2+ teams", detail: "Voluntary, peer-to-peer. Goal: 4+ confirmations for session 1", badge: "leadership", done: false },
            { id: "m5w1t3", title: "Run session 1: present TJ5600 design, invite challenge", detail: "Prepare a Miro board or 15 slides. Ask: 'What failure modes am I missing?'", badge: "leadership", done: false },
          ]
        },
        {
          week: 2, title: "Write cross-team RFC", goal: "Draft and share RFC that spans 2+ teams",
          tasks: [
            { id: "m5w2t1", title: "Pick RFC topic that affects 2+ teams", detail: "Good candidates: Kafka topic naming policy, circuit breaker config standards, schema registry adoption", badge: "leadership", done: false },
            { id: "m5w2t2", title: "Write full RFC using Google design doc format (5 sections)", detail: "Context → Goals/Non-goals → Proposal → Alternatives → Risks. Target 2–4 pages", badge: "leadership", done: false },
            { id: "m5w2t3", title: "Share with 3 reviewers from different teams — 10-day review window", detail: "Ask specific questions to drive comments. Update doc with decisions made.", badge: "leadership", done: false },
          ]
        },
        {
          week: 3, title: "Open-source contribution", goal: "Submit first contribution to Debezium or Spring",
          tasks: [
            { id: "m5w3t1", title: "Browse Debezium / Spring Boot issues for 'good first issue' labels", detail: "Spend 1 hour browsing. Pick one documentation or small bug issue to claim.", badge: "visibility", done: false },
            { id: "m5w3t2", title: "Submit PR or detailed bug report with minimal repro case", detail: "Fork, fix, test locally, open PR with clear description + issue reference", badge: "visibility", done: false },
          ]
        },
        {
          week: 4, title: "Blog post #4 + resume rewrite", goal: "Publish back-of-envelope post, rewrite resume",
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
            { id: "m6w1t2", title: "Record a 10-minute Loom walkthrough of your TJ5600 design", detail: "Explain: the problem, your decisions, the trade-offs, what you'd change.", badge: "visibility", done: false },
          ]
        },
        {
          week: 2, title: "Mock interviews ×3", goal: "Complete system design + DSA + behavioural mocks",
          tasks: [
            { id: "m6w2t1", title: "Complete 3 mock system design interviews on Pramp or with peers", detail: "Record them. Review and identify vocabulary gaps after each one", badge: "depth", done: false },
            { id: "m6w2t2", title: "Complete 3 mock DSA interviews on LeetCode Mock / Pramp", detail: "Timed — 45 min each. Narrate your approach as you code", badge: "depth", done: false },
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
            { id: "m6w4t1", title: "Write blog post #5: 'How I think about distributed systems trade-offs'", detail: "Your capstone. Synthesise everything from the past 6 months.", badge: "visibility", done: false },
            { id: "m6w4t2", title: "Fix any remaining interview weak spots identified from mocks", detail: "Re-do practice problems in 2 weakest areas. Book 1 more mock if needed.", badge: "depth", done: false },
          ]
        },
      ]
    },
  ];
}


// ─── API Routes ───────────────────────────────────────────────

// GET all data
app.get("/api/data", (req, res) => {
  res.json(readData());
});

// PUT full data save
app.put("/api/data", (req, res) => {
  const ok = writeData(req.body);
  res.json({ ok });
});

// PATCH specific section
app.patch("/api/data/:section", (req, res) => {
  const data = readData();
  const { section } = req.params;
  data[section] = req.body;
  const ok = writeData(data);
  res.json({ ok });
});

// GET skills
app.get("/api/skills", (req, res) => {
  const data = readData();
  res.json(data.skills || []);
});

// PUT skills
app.put("/api/skills", (req, res) => {
  const data = readData();
  data.skills = req.body;
  writeData(data);
  res.json({ ok: true });
});

// GET 6-month plan
app.get("/api/plan", (req, res) => {
  const data = readData();
  res.json(data.sixMonthPlan || []);
});

// PUT 6-month plan
app.put("/api/plan", (req, res) => {
  const data = readData();
  data.sixMonthPlan = req.body;
  writeData(data);
  res.json({ ok: true });
});

// GET today's data
app.get("/api/today", (req, res) => {
  const data = readData();
  const today = getTodayKey();
  res.json({ today, dayData: data.days[today] || { tasks: {}, checklist: {} } });
});

// POST upload image
app.post("/api/upload", (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }
    
    // image is expected to be a base64 string like "data:image/png;base64,iVBORw0KGgo..."
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid image format" });
    }
    
    const imageType = matches[1];
    const imageBuffer = Buffer.from(matches[2], "base64");
    
    // Extract extension (e.g. image/png -> png)
    const ext = imageType.split("/")[1] || "png";
    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    fs.writeFileSync(filepath, imageBuffer);
    
    // Return URL path for frontend to use
    res.json({ url: `/api/images/${filename}` });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Fallback to frontend
app.get("*", (req, res) => {
  const indexPath = path.join(FRONTEND_BUILD, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not built yet. Run ./start.sh");
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Architect Tracker running at http://localhost:${PORT}\n`);
  // Auto-open browser
  const { exec } = require("child_process");
  setTimeout(() => {
    exec(`xdg-open http://localhost:${PORT} 2>/dev/null || open http://localhost:${PORT} 2>/dev/null || echo "Open http://localhost:${PORT} in your browser"`);
  }, 1000);
});
