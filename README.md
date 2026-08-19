# SkillGraph

A graph-based platform that connects developers, their skills, projects, technologies, and suitable career roles — built on **CognoDB**, a managed graph database.

---

## Table of Contents

- [The Use Case](#the-use-case)
- [Why a Graph Database?](#why-a-graph-database)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Run Instructions](#setup--run-instructions)
- [Seed Data](#seed-data)
- [Key Cypher Queries](#key-cypher-queries)
- [Application Pages](#application-pages)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)

---

## The Use Case

SkillGraph helps answer questions that matter to developers and hiring teams — questions that are fundamentally about **connections**, not isolated records:

- Which developers know a given skill, and which projects used it?
- If I know React, what related skills (Next.js, Redux) open up more career paths?
- Given a developer's current skill set, which job roles do they best fit — even through skills they don't directly list, but are closely related to what they know?

Rather than a flat list of "developer profiles," SkillGraph models the real structure of this domain: developers, skills, projects, technologies, and job roles, all linked by typed relationships that can be traversed to surface non-obvious connections.

---

## Why a Graph Database?

The core of this application is **traversal** — following chains of relationships that vary in depth. This is where relational and document databases start to struggle, and where a graph database is a natural fit.

**Consider this query:** *"What job roles can a developer reach, not just from their direct skills, but from skills related to their skills (1–2 hops away)?"*

```cypher
MATCH (s:Skill {id: $id})-[:RELATED_TO*1..2]->(related:Skill)-[:REQUIRED_FOR]->(r:JobRole)
RETURN DISTINCT r.title, related.name
```

**In a relational database (SQL):** Modeling this requires a self-referencing `skill_relations` table and a recursive CTE (`WITH RECURSIVE`) to walk a variable number of hops. The query is hard to write, harder to read, and gets significantly slower as the hop count or dataset size grows — every additional hop is effectively another JOIN across the whole relation.

**In a document database (MongoDB):** Relationships like `HAS_SKILL`, `RELATED_TO`, and `REQUIRED_FOR` are inherently many-to-many. Embedding this data duplicates it everywhere it's referenced (and creates update anomalies), while referencing it means chaining multiple `$lookup` stages or multiple round-trip queries in application code — `$lookup` doesn't natively support variable-depth traversal either.

**In a graph database:** Every node stores direct pointers to its connected nodes ("index-free adjacency"). A multi-hop traversal is just pointer-following, not a search across an entire table. The query above runs as a single, declarative Cypher statement and stays fast as the graph grows, because the cost scales with the size of the traversal — not the size of the whole dataset.

This project uses that traversal capability directly: the **skill → related skill → job role** query is the centerpiece of the "Skill Detail" page, surfacing career paths that wouldn't be obvious from a flat skills list.

---

## Data Model

### Nodes

| Label | Key Properties |
|---|---|
| `Developer` | `id`, `name`, `experience`, `location`, `bio` |
| `Skill` | `id`, `name`, `category` |
| `Project` | `id`, `name`, `description` |
| `Technology` | `id`, `name`, `category` |
| `JobRole` | `id`, `title`, `description` |
| `Company` | `name` |

### Relationships

| Relationship | Direction | Meaning |
|---|---|---|
| `HAS_SKILL` | `Developer → Skill` | Developer possesses this skill |
| `WORKED_ON` | `Developer → Project` | Developer contributed to this project |
| `USES` | `Project → Technology` | Project is built with this technology |
| `RELATED_TO` | `Skill → Skill` | Skills that commonly go together |
| `REQUIRED_FOR` | `Skill → JobRole` | Skill is needed for this job role |
| `WORKED_AT` | `Developer → Company` | Developer's employer |

### Diagram

```
   Developer
   │
   ├── HAS_SKILL ──────> Skill ── RELATED_TO ──> Skill
   │                       │                        │
   │                       └── REQUIRED_FOR ──> JobRole
   │
   ├── WORKED_ON ──────> Project ── USES ──> Technology
   │
   └── WORKED_AT ──────> Company
```

Example traversal used throughout the app:

```
React ──RELATED_TO──> Next.js ──REQUIRED_FOR──> Full Stack Developer
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers (no separate server) |
| Database | CognoDB (graph database, Cypher over Bolt) |
| DB Driver | `neo4j-driver` (official Neo4j JavaScript driver — CognoDB is Bolt/Cypher-compatible) |
| Graph Visualization | `force-graph` |
| Icons | `lucide-react` |
| Hosting | Vercel |

---

## Architecture

```
                Next.js UI (App Router)
             Dashboard · Developers · Skills · Explore
                          │
                          │ fetch()
                          ▼
              Next.js API Route Handlers
                          │
                          │ neo4j-driver (Bolt)
                          ▼
                       CognoDB
                   (Graph Database)
```

A single driver instance is created and cached across requests (`lib/cognodb.ts`) rather than opening a new connection per API call, to stay within CognoDB's free-tier connection limits.

---

## Setup & Run Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd skillgraph
npm install
```

### 2. Create a CognoDB instance

1. Sign up at [console.cognodb.com/signup](https://console.cognodb.com/signup) (no credit card required).
2. Create a free (c0) instance and pick a region.
3. Copy the connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`) and the generated password for user `cognodb` — the password is shown only once.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```
COGNODB_URI=bolt+s://your-instance.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=your-password
```


This clears any existing data and creates ~30 developers, 25 skills, 25 projects, 12 technologies, 8 job roles, and the relationships connecting them.

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Seed Data

| Entity | Approximate Count |
|---|---|
| Developers | 30 |
| Skills | 25 |
| Projects | 25 |
| Technologies | 12 |
| Job Roles | 8 |
| `HAS_SKILL` relationships | 100+ |
| `WORKED_ON` relationships | 40+ |
| `USES` relationships | 60+ |
| `RELATED_TO` relationships | 30+ |
| `REQUIRED_FOR` relationships | 30+ |

---

## Key Cypher Queries

### 1. All developers
```cypher
MATCH (d:Developer) RETURN d ORDER BY d.name
```

### 2. A developer's skills
```cypher
MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill)
RETURN s
```

### 3. Multi-hop: developer → skills → job roles (2 hops)
```cypher
MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(r:JobRole)
RETURN DISTINCT r.title, count(s) AS matchingSkills
ORDER BY matchingSkills DESC
```
This powers the "Career Paths" match percentages on a developer's profile.

### 4. Variable-length traversal — the relationally awkward query
```cypher
MATCH (s:Skill {id: $id})-[:RELATED_TO*1..2]->(related:Skill)-[:REQUIRED_FOR]->(r:JobRole)
WHERE NOT (s)-[:REQUIRED_FOR]->(r)
RETURN DISTINCT r.title, related.name AS viaSkill
```
Finds job roles reachable through 1 or 2 hops of related skills, excluding roles the skill already qualifies for directly. This is the query that would require a recursive CTE in SQL, and can't be expressed as a single native `$lookup` in MongoDB. Used on the Skill Detail page under "Discovered Career Paths."

### 5. 1-hop neighborhood for graph visualization
```cypher
MATCH (center {id: $id})-[rel]-(neighbor)
RETURN center, neighbor, type(rel)
LIMIT 50
```
Powers the interactive Graph Explorer — clicking any node re-runs this query centered on the clicked node.

All queries are parameterized (`$id`, `$skillId`, etc.) via the official driver — no string concatenation.

---

## Application Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — entity counts, entry point to the explorer |
| `/developers` | Browsable list of developer profiles |
| `/developers/[id]` | Developer detail — skills, projects, career-path match %, connection graph |
| `/skills` | Browsable, searchable list of skills |
| `/skills/[id]` | Skill detail — who has it, related skills, direct + discovered job roles |
| `/explore` | Interactive graph explorer — click any node to traverse its connections |

Every page handles **loading**, **empty**, and **error** states (including a simulated database-down scenario, handled via `checkConnection()` in `lib/cognodb.ts`).

---

## Project Structure

```
skillgraph/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── developers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── skills/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── explore/page.tsx
│   └── api/
│       ├── stats/route.ts
│       ├── developers/route.ts
│       ├── developers/[id]/route.ts
│       ├── skills/route.ts
│       ├── skills/[id]/route.ts
│       ├── graph/[id]/route.ts
│       └── search/route.ts
├── components/
│   ├── Sidebar.tsx
│   ├── SearchBar.tsx
│   ├── GraphViewer.tsx
│   ├── DeveloperCard.tsx
│   └── StateComponents.tsx       # Loading / Empty / Error
├── lib/
│   └── cognodb.ts                # Driver + query helper
├── scripts/
│   └── seed.ts
├── .env.example
└── README.md
```

---

## Live Demo

- **Hosted app:** 