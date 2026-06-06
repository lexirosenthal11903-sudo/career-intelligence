# Agent Builder Skill — Jack & Jill Internal Framework

Source: https://github.com/Jack-and-Jill-AI/Jack_and_Jill_AI_Guides
Downloaded: 2026-06-06

Their internal framework for designing and building persistent AI agent personas from scratch.

---

## Overview

The Agent Builder guides creation of persistent AI agent personas through structured Q&A, producing four core workspace files: SOUL.md, AGENTS.md, MEMORY.md, and BOOTSTRAP.md.

## The Four Core Files

**SOUL.md** defines personality — communication style, core traits, emotional baseline, domain language, signature phrases, and anti-patterns. It prevents agents from sounding generic.

**AGENTS.md** provides the technical instruction set: what triggers the agent, file/system access, external services, output destinations, operational patterns, and escalation logic.

**MEMORY.md** offers durable context across sessions — platform URLs, known issues, workarounds, credentials map (secrets excluded), and escalation contacts.

**BOOTSTRAP.md** serves as onboarding for first-run initialization, directing to other files and setup requirements. Archived after successful configuration.

## The Q&A Flow

Five phases systematically collect information:

1. **Identity & Voice** (Q1-Q7): Name, description, archetype, domain language, emotional baseline, signature phrases, anti-patterns
2. **Purpose & Mechanics** (Q8-Q14): Invocation method, external services, file modification scope, required skills, credentials, database access, versioning strategy
3. **Outputs & Communication** (Q15-Q18): Output destinations, message format, escalation triggers, metrics tracking
4. **Continuity & Memory** (Q19-Q22): System facts needed, recurring patterns, credentials requirements, escalation contacts
5. **First Workflow** (Q23-Q25): Concrete operational procedure, success criteria, failure responses

## Generated Structure

```
agents/[slug]/
├── AGENTS.md
├── SOUL.md
├── MEMORY.md
├── BOOTSTRAP.md
├── references/[workflow].md
└── reports/
```

## Post-Generation Validation

Review SOUL.md for distinct voice, validate all placeholders filled, conduct personality check with simple task, test first workflow, iterate after 3-5 runs.

## Key Principles

- Conversational tone over formal policy language
- Explicit memory in files, not assumed retention
- Opinionated defaults requiring real decisions
- Personality as load-bearing structural element
- Single workflow first, expanding afterward
