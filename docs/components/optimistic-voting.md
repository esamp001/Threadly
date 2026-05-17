# Optimistic Voting

**Applies to:** `ThreadContent.jsx` · `CommentItem.jsx` · `maincontent.routes.js` · `comments.routes.js`

Reddit-style voting: the UI is always instantly interactive, clicks are never blocked, and only the **final resolved state** after the user stops clicking is sent to the server via a debounced request.

---

## Why the Original Code Was Broken

### Bug 1 — Debounce never worked

```js
// ❌ BEFORE — plain let vars inside the component body
let voteTimeout = null;
let abortController = null;
```

React re-renders the component on every `setState`. Because these were plain `let` variables, they were **reset to `null` on every render**. `clearTimeout(voteTimeout)` was always called with `null` — the previous timer was never cancelled. Every click fired its own independent API request.

### Bug 2 — UI was blocked while a request was in flight

```jsx
// ❌ BEFORE — click silently swallowed during loading
onClick={() => !loading && onVote('upvote')}
```

`loading` / `isVoting` / `votingCommentIds` state prevented clicks while a network request was pending. Reddit-style voting should **never block the UI**.

### Bug 3 — Stale closure read the wrong vote value

```js
// ❌ BEFORE — reads localUserVote from the render this closure was created in
const oldUserVote = localUserVote || 0;
```

If the user clicked 3× rapidly, calls #2 and #3 both closed over the vote value from the **initial render**, not the already-updated state. Caused incorrect toggle logic when spamming.

---

## The Solution — Three Parts

### Part 1 · `useRef` for debounce persistence

`useRef` holds a mutable box that survives re-renders without triggering them. The timer and abort controller are always the live ones.

```js
// ✅ ThreadContent
const voteTimeoutRef     = useRef(null);
const abortControllerRef = useRef(null);

// ✅ CommentItem — one slot per commentId
const voteTimeoutsRef     = useRef({}); // { [commentId]: timerId }
const abortControllersRef = useRef({}); // { [commentId]: AbortController }
```

### Part 2 · `pendingVoteRef` — always read the latest intended state

```js
// ✅ ThreadContent
const pendingVoteRef = useRef(null);

const currentVote = pendingVoteRef.current !== null
  ? pendingVoteRef.current
  : (localUserVote || 0);

// after computing newUserVote:
pendingVoteRef.current = newUserVote;

// ✅ CommentItem — keyed per comment
const pendingVoteRefs = useRef({});

const currentVote = pendingVoteRefs.current[commentId] !== undefined
  ? pendingVoteRefs.current[commentId]
  : (findCommentById(comments, commentId)?.userVote || 0);

pendingVoteRefs.current[commentId] = newUserVote;
```

No matter how fast the user clicks, each call reads the **already-updated ref**, not a stale render closure.

### Part 3 · Send the final state, not an action verb

```js
// ❌ BEFORE — sends what button was pressed
body: JSON.stringify({ threadId, voteType: 'upvote' })

// ✅ AFTER — sends the resolved destination state
body: JSON.stringify({ threadId, vote: finalVote }) // -1 | 0 | 1
```

The debounced request captures `finalVote = pendingVoteRef.current` at fire-time. Even if the user clicked upvote → downvote → upvote in rapid succession, only **one** request fires with the correct final value.

---

## Flow Diagram

```
User clicks upvote × 3 (rapid)
│
├─ Click 1 ──▶ pendingVoteRef = 1 ──▶ UI updates instantly
│              clearTimeout(null)    [nothing to cancel]
│              setTimeout(600ms) ──────────────────────────────────┐
│                                                                   │
├─ Click 2 ──▶ pendingVoteRef = 0 ──▶ UI updates instantly         │
│              clearTimeout(click 1 timer) ✅ cancelled             │
│              setTimeout(600ms) ──────────────────────────────────┐
│                                                                   │
├─ Click 3 ──▶ pendingVoteRef = 1 ──▶ UI updates instantly         │
│              clearTimeout(click 2 timer) ✅ cancelled             │
│              setTimeout(600ms) ──────────────────────────────────┐
│                                                                   │
│              ... 600ms of silence ...                             │
│                                                                   ▼
│                                               POST /vote { vote: 1 }
│                                               ONE request. Correct value.
```

---

## ThreadContent Implementation

```jsx
import { useRef, useState } from 'react';

// Optimistic UI state
const [localNetScore, setLocalNetScore] = useState(net_score);
const [localUserVote, setLocalUserVote] = useState(userVote);

// Refs — persist across renders, don't trigger re-renders
const voteTimeoutRef     = useRef(null);
const abortControllerRef = useRef(null);
const pendingVoteRef     = useRef(null); // latest intended vote

const handleVote = (voteType) => {
  // 1. Always read the latest value — never a stale closure
  const currentVote = pendingVoteRef.current !== null
    ? pendingVoteRef.current
    : (localUserVote || 0);

  // 2. Compute toggle result
  const newUserVote = voteType === 'upvote'
    ? (currentVote === 1 ? 0 : 1)
    : (currentVote === -1 ? 0 : -1);

  const scoreChange = newUserVote - currentVote;

  // 3. Instant optimistic UI — UI is never blocked
  setLocalNetScore(prev => prev + scoreChange);
  setLocalUserVote(newUserVote);
  pendingVoteRef.current = newUserVote;

  // 4. Cancel previous timer + in-flight request
  if (voteTimeoutRef.current) clearTimeout(voteTimeoutRef.current);
  if (abortControllerRef.current) abortControllerRef.current.abort();

  // 5. Debounce — only the final click fires the API
  voteTimeoutRef.current = setTimeout(async () => {
    const finalVote = pendingVoteRef.current;
    abortControllerRef.current = new AbortController();

    try {
      await apiRequest('/api/maincontent/threads/vote', {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({ threadId, vote: finalVote }),
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Rollback both state AND ref
        setLocalNetScore(prev => prev - scoreChange);
        setLocalUserVote(currentVote);
        pendingVoteRef.current = currentVote;
        showSnackbar('Error voting', 'error');
      }
    } finally {
      voteTimeoutRef.current = null;
      abortControllerRef.current = null;
    }
  }, 600);
};
```

### VotingComponent — no loading prop needed

```jsx
// ✅ Always clickable — no loading guard
<VotingComponent
  net_score={localNetScore}
  userVote={localUserVote}
  onVote={handleVote}
  size="large"
/>
```

---

## CommentItem Implementation

The same pattern, scoped per `commentId` since one component renders many comments.

```jsx
import { useRef, useState } from 'react';

// Ref-maps: one slot per commentId
const voteTimeoutsRef     = useRef({});
const abortControllersRef = useRef({});
const pendingVoteRefs     = useRef({});

// updateVoteRecursively now accepts the resolved numeric vote directly
const updateVoteRecursively = (comments, commentId, newUserVote) =>
  comments.map(comment => {
    if (comment.id === commentId) {
      const scoreChange = newUserVote - (comment.userVote || 0);
      return { ...comment, net_score: comment.net_score + scoreChange, userVote: newUserVote };
    }
    if (comment.replies?.length > 0)
      return { ...comment, replies: updateVoteRecursively(comment.replies, commentId, newUserVote) };
    return comment;
  });

const handleCommentVote = (actionType, commentId) => {
  // 1. Read latest from ref, fall back to tree search
  const currentVote = pendingVoteRefs.current[commentId] !== undefined
    ? pendingVoteRefs.current[commentId]
    : (findCommentById(comments, commentId)?.userVote || 0);

  // 2. Compute toggle
  const newUserVote = actionType === 'upvote'
    ? (currentVote === 1 ? 0 : 1)
    : (currentVote === -1 ? 0 : -1);

  // 3. Instant optimistic UI
  setComments(prev => updateVoteRecursively(prev, commentId, newUserVote));
  pendingVoteRefs.current[commentId] = newUserVote;

  // 4. Cancel previous timer + request for THIS comment only
  if (voteTimeoutsRef.current[commentId])
    clearTimeout(voteTimeoutsRef.current[commentId]);
  if (abortControllersRef.current[commentId])
    abortControllersRef.current[commentId].abort();

  // 5. Debounce
  voteTimeoutsRef.current[commentId] = setTimeout(async () => {
    const finalVote = pendingVoteRefs.current[commentId];
    abortControllersRef.current[commentId] = new AbortController();

    try {
      await apiRequest('/api/comments/vote', {
        method: 'POST',
        signal: abortControllersRef.current[commentId].signal,
        body: JSON.stringify({ commentId, vote: finalVote }),
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Rollback both state and ref
        setComments(prev => updateVoteRecursively(prev, commentId, currentVote));
        pendingVoteRefs.current[commentId] = currentVote;
        showSnackbar('Error voting', 'error');
      }
    } finally {
      delete voteTimeoutsRef.current[commentId];
      delete abortControllersRef.current[commentId];
    }
  }, 600);
};
```

### VotingComponent — no loading prop needed

```jsx
// ✅ Always clickable
<VotingComponent
  net_score={comment.net_score}
  userVote={comment.userVote}
  onVote={(voteType) => handleCommentVote(voteType, comment.id)}
/>
```

---

## Backend Contract

Both routes follow the same contract. Accept `vote` as a number, not an action verb.

**Endpoint:** `POST /api/maincontent/threads/vote` · `POST /api/comments/vote`

**Request body:**
```json
{ "threadId": 42, "vote": 1 }   // upvote
{ "threadId": 42, "vote": -1 }  // downvote
{ "threadId": 42, "vote": 0 }   // remove vote
```

**Logic:**
```js
const prevVote = existingVote ? existingVote.vote_type : 0;

// Idempotent guard — no DB writes if already in desired state
if (prevVote === vote) return;

// Remove old vote row + undo counters
if (existingVote) { /* DELETE, decrement */ }

// Insert new vote row + update counters + award EXP
if (vote !== 0) { /* INSERT, increment */ }
```

> **Idempotent guard:** If the user spams upvote × 5 and the debounce fires once with `vote: 1`, but the DB already has `vote_type: 1` from a previous fire — it's a no-op. No double-counting.

---

## Key Rules

| Rule | Reason |
|---|---|
| Use `useRef` for timers and controllers | `let` vars reset on every re-render — debounce breaks silently |
| Use `pendingVoteRef` to track intended state | React state is async — closures go stale between rapid clicks |
| Send final numeric state (`vote`) not action verb | Server gets the correct intent regardless of how many times the user spammed |
| Never block the UI with `loading` | Optimistic UI + debounce = instant feel with accurate data |
| Roll back both state AND ref on error | Ref out of sync with state causes wrong toggle on the next click |
| Per-comment ref-maps in CommentItem | One component renders N comments — each needs its own independent debounce slot |
