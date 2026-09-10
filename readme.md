# TaskFlow Backend 🚀

TaskFlow is a backend-focused **Project Management SaaS** built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

It provides organization-based project management with authentication, RBAC, teams, projects, sprints, tasks, subtasks, comments, attachments, activity logs, subscriptions, and Stripe payments.

---

## 🌐 Live API

### Production Backend

https://taskflow-backend-xviv.onrender.com

### API Base URL

https://taskflow-backend-xviv.onrender.com/api/v1

### Health Check

GET /

Example:

```json
{
  "success": true,
  "version": "1.0.0",
  "message": "Welcome to the TaskFlow Backend Server!",
  "timestamp": "...",
  "uptime": "..."
}
```
✨ Features
User registration and login
JWT authentication
Access token + refresh token
HttpOnly cookie authentication
Google OAuth login
Email verification with OTP
Password reset with OTP
User profile management
Cloudinary image upload
Platform Admin/User roles
Organization Manager/Member roles
Multi-organization support
Organization invitations
Organization member management
Team management
Project management
Project member management
Sprint management
Task management
Task assignment
Task status transitions
Subtasks
Comments
File attachments(under development)
Activity/audit logs
FREE and PRO subscriptions
Subscription limits
Stripe Checkout
Stripe webhook handling
Payment records
Pagination
Searching
Filtering
Sorting
Soft deletes
Prisma transactions
Zod validation
Centralized error handling
Redis support
Email support
Security middleware
RESTful API architecture


## Tech Stack

| Technology       | Purpose               |
| ---------------- | --------------------- |
| **Node.js**      | Runtime               |
| **TypeScript**   | Programming Language  |
| **Express.js**   | REST API              |
| **Prisma 7**     | ORM                   |
| **PostgreSQL**   | Database              |
| **Redis**        | OTP / Cache           |
| **JWT**          | Authentication        |
| **bcrypt**       | Password Hashing      |
| **Zod**          | Request Validation    |
| **Stripe**       | Subscription Payments |
| **Cloudinary**   | Image/File Storage    |
| **Nodemailer**   | Email                 |
| **Google OAuth** | Social Login          |
| **Multer**       | File Upload           |

## 🏗️ Architecture

The project follows a modular backend architecture.

```text
src/
│
├── config/
├── lib/
├── middleware/
│
└── modules/
    ├── auth/
    ├── user/
    ├── organization/
    ├── organizationInvitation/
    ├── team/
    ├── project/
    ├── sprint/
    ├── task/
    ├── subtask/
    ├── comment/
    ├── attachment/
    ├── activityLog/
    ├── subscription/
    └── payment/
```

Each module generally contains:

```text
module/
├── controller.ts
├── service.ts
├── route.ts
├── validation.ts
└── interface.ts
```

🗄️ Main Entities

TaskFlow contains the following major entities:

- User
- Organization
- OrganizationMember
- OrganizationInvitation
- Team
- TeamMember
- Project
- ProjectMember
- Sprint
- Task
- Subtask
- Comment
- Attachment
- ActivityLog
- Subscription
- Payment

👥 Roles & Permissions

TaskFlow uses three primary business roles.

Platform Roles
- ADMIN
- USER

These are stored on the User model.

Organization Roles
- MANAGER,
- MEMBER

These are stored on OrganizationMember.

A user can belong to multiple organizations and can have different organization roles in each organization.

🔐 Authentication

TaskFlow supports:

🔐 Authentication

TaskFlow supports:

- Email/password authentication
- Google OAuth
- Email verification
- Password reset
- JWT access tokens
- JWT refresh tokens
- HttpOnly cookies
- Bearer token support

🏢 Organization Management

Authenticated users can create organizations.

When an organization is created:

- User
 ↓
- Organization
 ↓
- OrganizationMember
 ↓
- MANAGER
 ↓
- FREE Subscription

Organization managers can:

- Invite members
- View members
- Change member roles
- Remove members
- Manage teams
- Manage projects
- Manage billing/subscriptions

Organization Invitations

Registered users can be invited to organizations.

Invitation flow:
```text
Manager
   ↓
Send Invitation
   ↓
Pending
   ↓
Recipient
   ├── Accept
   └── Reject
```

Managers can also cancel pending invitations.

### Teams

- Teams belong to organizations.

### Managers can:

- Create teams
- Update teams
- Delete teams
- Add members
- Remove members
- View team members

Team members must already belong to the organization.

# 📁 Projects

Projects belong to **organizations**.

## Project Management

Managers can:

* ✅ Create projects
* ✏️ Update projects
* 📦 Archive projects
* 👥 Add project members
* ❌ Remove project members

> **Note:** Project members must already belong to the organization before they can be added to a project.

🏃 Sprints

Projects can contain multiple sprints.

Sprint statuses:
```text
PLANNED
ACTIVE
COMPLETED
ARCHIVED
```
Only one sprint can be active in a project at a time.

A sprint cannot be completed while it contains unfinished tasks.

✅ Tasks

Tasks belong to projects.

Task statuses:
```text
TODO
IN_PROGRESS
IN_REVIEW
DONE
```

Valid status transitions are enforced by the backend.

Tasks also support:

- Priority
- Assignment
- Sprint association
- Due dates
- Subtasks
- Comments
- Attachments
- Soft deletion

Task priorities:
```
LOW
MEDIUM
HIGH
URGENT
```
🔹 Subtasks

Tasks can contain subtasks.

Subtask statuses:
```
TODO
IN_PROGRESS
DONE
```

Subtasks support:
- Assignment
- Status changes
- Updates
- Soft deletion

💬 Comments

Users with access to a task can create comments.

Comments support:

- Create
- List
- Update
- Soft delete

Members can update/delete their own comments while managers have broader permissions.

📊 Activity Logs

Important actions are recorded in the activity log.

💳 Subscription System

TaskFlow supports:
```
FREE
PRO
```

The backend enforces subscription limits.

For example, the FREE plan has limits on:

- Projects
- Teams
- Tasks

PRO organizations have higher/unlimited access to these resources according to the application's subscription rules.

💰 Stripe Payments

TaskFlow uses Stripe Checkout for PRO subscriptions.

Payment flow:
```
Organization Manager
        ↓
Create Payment
        ↓
Stripe Checkout
        ↓
Complete Payment
        ↓
Stripe Webhook
        ↓
Verify Webhook Signature
        ↓
Payment → PAID
        ↓
Subscription → PRO
        ↓
Activity Logs
```

🔒 Security

The backend implements:

- JWT authentication
- HttpOnly cookies
- Password hashing with bcrypt
- Role-based authorization
- Organization-level authorization
- Resource-level authorization
- Tenant isolation
- Zod validation
- Helmet
- CORS
- Rate limiting
- Stripe webhook signature verification
- File upload validation
- Soft deletion
- Prisma parameterized queries
- Centralized error handling

🧱 Multi-Tenant Security

Organization resources are protected using organization membership.

General authorization flow:
```
Authenticated User
       ↓
Organization Membership
       ↓
Organization Role
       ↓
Resource Ownership / Membership
       ↓
Permission

```
This prevents users from accessing resources belonging to other organizations.

🗑️ Soft Delete

Important resources use soft deletion.

🔄 Transactions

Prisma transactions are used for important multi-step operations.

Examples:

- Organization creation
- Invitation acceptance
- Member removal
- Project creation
- Task creation
- Payment processing

This helps keep related database changes consistent.

🚀 Local Setup
```
git clone <repository-url>
cd assignment6
npm install
```

🎯 Project Objectives

TaskFlow demonstrates practical backend development concepts including:

- REST API development
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- Authentication
- Authorization
- RBAC
- Multi-tenancy
- Database transactions
- Validation
- File uploads
- Cloud storage
- Payment integration
- Stripe webhooks
- Subscription management
- Audit logging
- Security
- Production deployment

👨‍💻 Author
TaskFlow Backend

Built with:

Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis + Stripe + Cloudinary