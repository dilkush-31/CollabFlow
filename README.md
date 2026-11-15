# CollabFlow

A collaborative project management tool built with React, Express, MySQL, and Socket.IO. Teams create projects, add members, assign tasks on a Kanban board, discuss work in comments, and get notified about assignments and deadlines.

## Features

- JWT authentication with bcrypt password hashing
- Roles: Admin, Project Manager, and Team Member
- Projects with membership roles (manager or member)
- Tasks with priority, deadline, assignee, and status
- Kanban board: To Do, In Progress, Completed
- Comments on tasks
- Notifications for assignments, comments, and deadlines
- Real-time updates with Socket.IO
- Dashboard with counts, overdue tasks, and project progress

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MySQL with mysql2 |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |

## Project structure

```
CollabFlow/
├── frontend/     React + Vite app
└── backend/      Express API, Socket.IO, MySQL access
```

## Setup

### Prerequisites

- Node.js 18 or newer
- MySQL Server 8
- MySQL Workbench (optional, for running SQL)

### 1. Database

Create the database and run the schema scripts (users, projects, project_members, tasks, comments, notifications, activity_logs) in MySQL.

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=collabflow
JWT_SECRET=a_long_random_string
```

Start the server:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/projects` | Projects visible to the user |
| POST | `/api/projects` | Create a project (admin or project manager) |
| GET | `/api/projects/:id` | Project details and members |
| POST | `/api/projects/:id/members` | Add a member (project manager) |
| GET | `/api/projects/:id/tasks` | Tasks in a project |
| POST | `/api/projects/:id/tasks` | Create a task (project manager) |
| PATCH | `/api/tasks/:id` | Update a task |
| GET | `/api/tasks/:id/comments` | List comments |
| POST | `/api/tasks/:id/comments` | Add a comment |
| GET | `/api/notifications` | Notifications and unread count |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/dashboard/summary` | Counts |
| GET | `/api/dashboard/overview` | Overdue tasks and project progress |

## Real-time events

| Event | Direction | Purpose |
|---|---|---|
| `project:join` / `project:leave` | Client to server | Subscribe to a project's updates |
| `task:created`, `task:updated` | Server to project room | Refresh the board |
| `comment:new` | Server to project room | Show new comments |
| `notification:new` | Server to user | Update the bell |

## Roles

- **Admin:** Full access to all projects and tasks.
- **Project Manager:** Can create projects and, within their projects, add members and create or edit tasks.
- **Team Member:** Can view projects they belong to, comment, and change the status of tasks assigned to them.

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- Secrets live in `.env`, which is excluded from Git.
- Socket connections require a valid JWT, and project rooms are checked against membership.

## Roadmap

- Activity feed in the project view
- Drag-and-drop on the Kanban board
- Email notifications