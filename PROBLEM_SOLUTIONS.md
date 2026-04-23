# Known Pitfalls & Problem Solutions

This document serves as a knowledge base for hard-to-debug architectural problems and their definitive solutions within the Manach codebase.

---

## 1. Chat — Duplicate Messages (React + Socket.io)

**Symptom**: A sent message appeared twice in the chat window.

**There were multiple root causes. The final fix addresses all of them.**

### Root Cause 1 — Backend: Double Room Emit
Admins join **both** `user_{adminId}` AND `admin_room` on connect. The original server code emitted to
both in the same chain, so admins received every message twice.

```js
// ❌ WRONG — admin receives message twice (member of both rooms)
io.to(`user_${receiverId}`).to("admin_room").emit("receive_message", data)

// ✅ CORRECT — choose ONE path per sender type
if (isAdmin) {
  // Admin → customer room + admin echo
  io.to(`user_${receiverId}`).to("admin_room").emit("receive_message", messageData);
} else {
  // Customer → echo to self + notify admin_room
  io.to(`user_${senderId}`).to("admin_room").emit("receive_message", messageData);
}
```

**Rule**: Never emit to `user_{adminId}` AND `admin_room` in the same chain.

---

### Root Cause 2 — Frontend: Wrong `useEffect` dependencies
Socket `useEffect` had `[userId, dispatch]` deps. When `userId` changed from `null` → real value, React re-ran the effect, creating a second socket and stacking listeners.

**Fix**: Use `[]` (empty array). Move `join_room` to a separate `[userId]` effect.

---

### Root Cause 3 — Frontend: `socket.disconnect()` in cleanup
Even with `[]` deps and the `socketRef` guard, removing `disconnect()` from cleanup was
not enough. The cleanup was also calling `socket.off(handler)` to remove listeners. Here is the exact failure sequence with React StrictMode:

```
Mount   → socketRef = null → socket created, listeners added, socketRef = socket  ✓
Unmount → cleanup runs   → socket.off() removes listeners, socketRef left as socket
Remount → socketRef != null → guard fires → exits early → listeners NEVER re-added
Result  → socket alive but DEAF — sends work, receives don't show
```

---

### ✅ FINAL Definitive Socket Pattern

```jsx
const socketRef = useRef(null)

// ── Effect 1: Create socket ONCE. deps MUST be [].
useEffect(() => {
  if (socketRef.current) return // StrictMode guard

  const socket = io('http://localhost:8080', { forceNew: true })
  socketRef.current = socket

  const handleReceiveMessage = (data) => { /* dispatch or setState */ }
  const handleTyping = () => { /* setState */ }

  socket.on('receive_message', handleReceiveMessage)
  socket.on('user_typing', handleTyping)

  // ❗ NO cleanup return here.
  //
  // StrictMode unmount+remount is FAKE. The guard ensures no duplicate socket/listener.
  // Removing listeners in cleanup makes the socket deaf on remount (guard skips re-adding them).
  // Disconnecting in cleanup resets the socket, letting the remount create a duplicate.
  //
  // ❌ DON'T: return () => { socket.off(handler) }         ← makes socket deaf
  // ❌ DON'T: return () => { socket.disconnect() }         ← creates duplicate on remount
  // ❌ DON'T: return () => { socketRef.current = null }    ← defeats the guard
}, []) // ← MUST be empty array

// ── Effect 2: Join rooms AFTER userId is ready. KEEP SEPARATE from Effect 1.
useEffect(() => {
  if (userId && socketRef.current) {
    socketRef.current.emit('join_room', userId)
  }
}, [userId])
```

**Rules summary**:

| Rule | Reason |
|---|---|
| `useEffect(fn, [])` | Socket created once; no re-runs when state changes |
| `if (socketRef.current) return` | StrictMode remount is a no-op |
| `forceNew: true` | Fresh socket with no cached transport state |
| **No cleanup at all in Effect 1** | Keeps socket AND listeners alive through StrictMode fake-unmount |
| Separate `[userId]` effect | Joins room without touching the socket connection |

**Defense-in-depth** (keep, do NOT remove):
- Redux `addMessage` deduplicates by `String(message_id)` with a text+time fallback
- `AdminChat.jsx` has its own local `message_id` dedup guard in `setMessages`

---

## 2. React StrictMode Double-Invoke

In development (`npm run dev`), React 18 StrictMode mounts → unmounts → remounts every component.
The unmount is **fake** — it tests that your cleanup is correct but does not represent real user navigation.

**Rules**:
- **Sockets**: Follow the exact pattern in Section 1. No cleanup in Effect 1. `socketRef` guard handles remount.
- **API calls on URL params** (e.g., PayPal capture redirect): Clear the trigger flag (e.g., `sessionStorage.removeItem(...)`) **before** the async call so the second invocation exits early.
