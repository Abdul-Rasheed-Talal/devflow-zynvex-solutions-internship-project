# DevFlow — Database Schema

This document is the initial target. Do not implement models that belong to later modules before their module begins.

## Module 1

### User
- _id
- name
- email
- passwordHash
- avatar (optional, only if needed)
- createdAt
- updatedAt

Authentication-related secrets must never be returned in API responses.

## Planned later models

### Project
- _id
- name
- description
- owner
- members
- status
- priority
- startDate
- dueDate
- createdAt
- updatedAt

### Task
- _id
- project
- title
- description
- status
- priority
- assignee
- labels
- dueDate
- createdAt
- updatedAt

### Comment
### Notification
### Activity

Their exact schemas must be finalized before implementation of the corresponding module.
