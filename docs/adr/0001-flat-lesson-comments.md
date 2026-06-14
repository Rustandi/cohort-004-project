# 1. Flat lesson comments (no threading)

Date: 2026-06-14
Status: Accepted

## Context

We are adding a public discussion feature under lessons (students comment on a
lesson, visible to other enrolled students). A core design fork is whether
comments are **flat** (a single chronological list) or **threaded** (replies
nest under parent comments).

Threading adds: a `parentId` self-reference on the table, recursive rendering,
orphan handling on delete (soft-delete to preserve replies), and a more complex
sort model. It is the larger build by a wide margin.

## Decision

Comments are **flat** in v1. The `comments` table has no `parentId`. The list
is a single newest-first stream.

## Consequences

- Hard delete is safe — there are no child replies to orphan (see ADR-0005).
- Simpler schema, query, and rendering; ships sooner.
- Threading remains a future addition (add `parentId`, switch to soft delete)
  and is explicitly out of scope for v1.
