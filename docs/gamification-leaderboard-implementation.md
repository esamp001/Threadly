# Global Gamification Leaderboard Implementation Documentation

## Overview

This document outlines the implementation of the Global Gamification Leaderboard for the Threadly application. The leaderboard is a premium, high-impact feature designed to drive user engagement and gamify community contributions. It provides an immediate, top-drop interactive drawer accessible globally from the platform header (on both desktop and mobile), divided into two competitive tabs: **Level Masters** and **Space Legends**.

---

## Features Implemented

### 1. Unified Leaderboard Trigger
- **Desktop Navigation**: Styled click-to-open `TrendingUp` icon in the central header navigation block, wrapped with a clean, animated Material-UI `Tooltip`.
- **Mobile Navigation**: Seamlessly integrated "Leaderboard" item under the `SPACES SETTINGS` section of the mobile drawer sidebar, maintaining accessibility on all screen sizes.

### 2. Dual-Tab Rankings
- **Level Masters**: Displays the top 10 users ranked globally by their Level & Cumulative Experience Points (XP) from the `users` table.
- **Space Legends**: Displays the top 10 users ranked globally by the sum of their Contributor Points across all Spaces from the `space_contributor_points` table.

### 3. State-of-the-Art UI Design
- **Premium Glassmorphism Drawer**: A top-anchored drawer container utilizing dynamic dark-mode backdrop filters (`blur(20px)`), smooth CSS translations, and harmonious Material-UI typography.
- **Octo Mascot Speech Row**: Integrated a floating Octo Mascot graphic coupled with a responsive, glassmorphic speech bubble that dynamically updates to explain the competitive rules and scoring methodology for the currently active tab (Level Masters vs. Space Legends).
- **Lazy Data Loading**: Skeletons animate on open to prevent visual jarring while fetching leaderboard data, and lazy loading ensures we only call the API once per mount/trigger, minimizing server overhead.
- **Podium Styling & Badges**: Clean rank indices with customizable badges for the top three competitors (🥇 Gold, 🥈 Silver, 🥉 Bronze), distinct styling highlights for the current logged-in user, and clean color-coded status badges for levels and points.
- **Interactive Navigation**: Interactive cards that allow users to click any avatar or username to immediately navigate directly to that user's profile, automatically closing the drawer.

---

## Database Queries

### 1. Level Rankings Query
Fetches the top users ranked by experience points:
```javascript
levels = await knex('users')
  .select('id', 'username', 'avatar_url', 'exp_points', 'level')
  .orderBy('exp_points', 'desc')
  .limit(10);
```

### 2. Contributor Rankings Query
Aggregates and sums individual space contributions to rank global legends:
```javascript
const rawContributors = await knex('space_contributor_points')
  .join('users', 'space_contributor_points.user_id', 'users.id')
  .select(
    'users.id',
    'users.username',
    'users.avatar_url',
    knex.raw('SUM(space_contributor_points.points) as total_points')
  )
  .groupBy('users.id', 'users.username', 'users.avatar_url')
  .orderBy('total_points', 'desc')
  .limit(10);
```

---

## API Endpoints

### Leaderboard Route (`/api/header/leaderboard`)

#### GET `/api/header/leaderboard`
**Description**: Get global leaderboard rankings (Level Masters and Space Legends lists)
**Authentication**: Required
**Request Headers**:
- `Authorization: Bearer <JWT_TOKEN>`

**Response (Success - 200)**:
```json
{
  "success": true,
  "status": 200,
  "error_message": "",
  "levels": [
    {
      "id": 2,
      "username": "explorer_jane",
      "avatar_url": "https://example.com/jane.jpg",
      "exp_points": 1000,
      "level": 9
    }
  ],
  "contributors": [
    {
      "id": 3,
      "username": "contributor_bob",
      "avatarUrl": "https://example.com/bob.jpg",
      "total_points": 250
    }
  ]
}
```

---

## Frontend Integration

### Header Component (`src/components/HomeComponents/Header.jsx`)

#### Local States Managed:
- `openLeaderboardDrawer` (boolean): Controls display of the top drop-down leaderboard drawer.
- `leaderboardLoading` (boolean): Manages loading state and animates the skeleton rows.
- `leaderboardTab` (number): Handles switching between Level Masters (0) and Space Legends (1) tabs.
- `leaderboardData` (object): Caches fetched levels and contributors arrays to prevent double-fetching on subsequent clicks.

#### Functions Added (with JSDoc documentation):
- `handleLeaderboardTabChange`: Switches active tabs inside the leaderboard drawer.
- `handleLeaderboardClick`: Opens the drawer and triggers the lazy fetch.
- `fetchLeaderboardData`: Communicates with backend endpoints using the platform-wide `apiRequest` utility.

---

## Backend Tests

### Test Suite (`backend/tests/leaderboard.test.js`)
Comprehensive integration testing built on **Jest** and **Supertest** ensuring reliability:

#### Coverage:
- **Authorization**: Rejects requests missing headers or utilizing invalid tokens with a `401 Unauthorized` status.
- **Schema & Data Types**: Asserts the endpoint successfully returns lists structure (`levels`, `contributors` arrays) with a `200` status.
- **Level Rankings Sorting**: Asserts global users are correctly returned in descending order of XP points.
- **Space Legends Sorting**: Asserts contribution points are aggregated across different rows/spaces and sorted correctly in descending order.
- **Self-Healing Suite**: Includes a custom query set in `beforeAll` that cleans up any residual test data from crashed previous attempts, preventing database key collision.

---

## Performance & Security Considerations

### 1. Performance Optimizations
- **Index-Friendly Queries**: Utilizing indexed foreign keys `user_id` and `space_id` in `space_contributor_points` to execute the aggregation query efficiently.
- **Result Limits**: Applying `.limit(10)` ensures that we only process and transfer the top 10 rows, avoiding massive table scans and reducing payload sizes.
- **Frontend Caching**: Caching the loaded data locally in React component states so that users clicking the icon multiple times during their session do not spam the database.

### 2. Security Details
- **Token Verification**: Fully guarded behind the `checkAuth` middleware, verifying signature authenticity before processing database queries.
- **Sanitized SQL**: Knex queries utilize parameter binding for all dynamic parameters, preventing SQL injection vectors.
- **Public Metadata Exposure**: Only returns standard public fields (`id`, `username`, `avatar_url`, `level`, `points`), strictly omitting private user details (such as emails, passwords, and tokens).
