# Product Requirements Document (PRD)
# Discipline Habit Tracker

---

## 1. Product Overview

| Field         | Details                             |
|---------------|-------------------------------------|
| Product Name  | Discipline Habit Tracker (UrHabit)  |
| Platform      | Web Application                     |
| Stack         | Next.js 16, TypeScript, Tailwind CSS |
| Database      | SQLite (Prisma ORM)                 |
| Auth          | NextAuth.js v5                      |

### Vision
Help users build consistent habits through tracking, streak monitoring, progress analytics, reminders, gamification, and AI-based insights. The platform motivates users via visual progress, rewards, and intelligent suggestions.

---

## 2. Problem Statement

People struggle to maintain habits (exercise, study, code, read, meditate) due to:
- Lack of consistency
- No visual progress tracking
- Losing motivation quickly
- Forgetting scheduled habits

---

## 3. Product Goals

### Primary Goals
- Enable daily habit tracking
- Improve consistency with streak tracking
- Provide clear visual analytics
- Increase engagement using gamification
- Deliver AI insights for habit improvement

### Success Metrics
- Daily active users
- Habit completion rate
- Average streak length
- Weekly retention rate
- User engagement time

---

## 4. Target Users

### Primary Users
- Students
- Developers
- Fitness enthusiasts
- Productivity-focused individuals

### Example Persona
**Name:** Uday  
**Goals:** Maintain gym routine, practice coding daily, improve discipline  
**Pain Points:** Forgetting habits, lack of motivation, no clear progress tracking

---

## 5. User Flow

```
Register/Login → Create Habits → Daily Tracking → Monitor Dashboard → Earn Rewards
```

1. **Registration** – Email/password or Google OAuth
2. **Create Habits** – Name, category, frequency, reminder time
3. **Daily Tracking** – Mark habits as complete each day
4. **Progress Monitoring** – Dashboard with streaks, charts, calendar
5. **Motivation** – Earn XP, level up, unlock badges

---

## 6. Core Features (MVP – Version 1)

### 6.1 Authentication
- Sign up / Log in / Log out
- **NextAuth.js** with Email + Google provider
- Session management

### 6.2 Habit Management (CRUD)
| Field         | Example          |
|---------------|------------------|
| Habit Name    | Coding           |
| Category      | Learning         |
| Frequency     | Daily            |
| Reminder Time | 8:00 PM          |

### 6.3 Habit Completion
- Mark habits as done per day
- Completion records stored with timestamps
- UI: ✓ Gym | ✓ Coding | ☐ Reading

### 6.4 Streak Counter
- Track consecutive days of completion
- Logic: If completion exists for consecutive days → streak increases
- Display: 🔥 12 day streak

### 6.5 Dashboard
| Metric          | Example |
|-----------------|---------|
| Total Habits    | 5       |
| Completed Today | 3       |
| Current Streak  | 12      |
| Success Rate    | 60%     |

---

## 7. Progress Tracking (Version 2)

### 7.1 Habit Calendar
- GitHub-style contribution heatmap
- Green = completed, Gray = missed
- Library: `react-heatmap-grid`

### 7.2 Progress Analytics
- Weekly completion bar chart
- Monthly progress line chart
- Habit consistency trend
- Library: `recharts`

---

## 8. Reminder System (Version 3)

- Browser push notifications
- Email reminders via scheduled cron
- Firebase Cloud Messaging (future)

---

## 9. Gamification System (Version 3)

### XP System
| Action              | XP Reward |
|---------------------|-----------|
| Habit Completed     | +10 XP    |
| 7-day streak        | +50 XP    |
| 30-day streak       | +200 XP   |

### Levels
| Level | Title             | Required XP |
|-------|-------------------|-------------|
| 1     | Beginner          | 0           |
| 5     | Consistent        | 500         |
| 10    | Discipline Master | 1000        |

Formula: `Level = Math.floor(XP / 100) + 1`

### Badges
| Achievement       | Badge  |
|-------------------|--------|
| 7-day streak      | Bronze |
| 30-day streak     | Silver |
| 100-day streak    | Gold   |

---

## 10. AI Features (Version 4)

### 10.1 AI Habit Coach
- User enters a goal
- AI suggests relevant habits
- Powered by OpenAI / Gemini API

### 10.2 Habit Failure Analysis
- AI analyzes missed habit patterns
- Example: "You frequently miss workouts on Mondays"

---

## 11. Social Features (Version 5)

- Friend system
- Global leaderboard (top streaks)
- Public habit profile

---

## 12. Technology Stack

| Layer          | Technology                       |
|----------------|----------------------------------|
| Frontend       | Next.js 16, React, Tailwind CSS  |
| Backend        | Next.js API Routes               |
| Authentication | NextAuth.js v5                   |
| Database       | SQLite via Prisma ORM            |
| Charts         | Recharts                         |
| Icons          | Lucide React                     |
| Notifications  | Web Push API / Firebase          |

---

## 13. Project Folder Structure

```
urhabit/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── habits/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── achievements/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── habits/route.ts
│   │   └── completions/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/            (Button, Card, Input, Badge, etc.)
│   ├── habits/        (HabitCard, HabitList, AddHabitModal)
│   ├── dashboard/     (StatsCard, StreakCounter)
│   ├── analytics/     (WeeklyChart, HeatmapCalendar)
│   └── layout/        (Sidebar, Navbar, Header)
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── PRD.md
```

---

## 14. Database Schema

### Users
```sql
id, name, email, password, xp, level, created_at
```

### Habits
```sql
id, user_id, habit_name, category, frequency, reminder_time, color, icon, created_at
```

### Habit Completions
```sql
id, habit_id, date, completed
```

### Badges (earned)
```sql
id, user_id, badge_name, earned_at
```

---

## 15. Development Roadmap

| Version | Features                                          | Status      |
|---------|---------------------------------------------------|-------------|
| v1 MVP  | Auth, Habit CRUD, Completion, Dashboard           | In Progress |
| v2      | Streak tracking, Progress charts, Calendar        | Planned     |
| v3      | Notifications, XP system, Levels, Badges          | Planned     |
| v4      | AI habit suggestions, Failure analysis            | Planned     |
| v5      | Friends, Leaderboard, Public profiles             | Planned     |

---

## 16. Color Palette

| Token      | Hex       | Usage                  |
|------------|-----------|------------------------|
| Primary    | `#4A5C2F` | Olive green – CTAs     |
| Primary 2  | `#6B8C3A` | Lighter olive          |
| Accent     | `#8BAF48` | Highlights, badges     |
| Background | `#0A0A0A` | Main background        |
| Surface    | `#141414` | Cards, panels          |
| Border     | `#2A2A2A` | Dividers               |
| Text       | `#F5F5F5` | Primary text           |
| Muted      | `#888888` | Secondary text         |

---

*Last Updated: March 2026 | Stack: Next.js 16 + TypeScript + Tailwind CSS + Prisma + NextAuth.js*
