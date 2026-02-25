# Bluesky Feed Viewer — Build Prompt

Use this document as a prompt for Claude or another AI coding assistant in VS Code to recreate the Bluesky feed viewer from scratch.

---

## What to build

A **single-file HTML page** (`bluesky-feed-viewer.html`) that lets you view any public Bluesky user's feed and browse threads. No backend, no build tools — just open the file in a browser.

---

## Bluesky API reference

All requests go to the **public, unauthenticated** Bluesky AppView API:

```
Base URL: https://public.api.bsky.app/xrpc
```

### Endpoints used

| Endpoint | Purpose | Key params |
|---|---|---|
| `app.bsky.actor.getProfile` | Get user profile (name, avatar, banner, bio, follower counts) | `actor` (handle or DID) |
| `app.bsky.feed.getAuthorFeed` | Get a user's posts | `actor`, `limit` (max 100), `cursor` (pagination), `filter` |
| `app.bsky.feed.getPostThread` | Get full thread for a post (parents + replies) | `uri` (AT-URI), `depth` (reply depth, max 1000), `parentHeight` (ancestor depth, max 1000) |

### Feed filter values

- `posts_and_author_threads` — posts and self-threads (default)
- `posts_with_replies` — includes replies to others
- `posts_with_media` — only posts with images/video
- `posts_no_replies` — posts only, no replies

### Thread response shape

```
thread: {
  post: PostView,            // the requested post
  parent?: ThreadViewPost,   // nested chain of ancestors (parent.parent.parent...)
  replies?: ThreadViewPost[] // array of direct replies, each with their own .replies
}
```

Each post's `uri` field is an AT-URI like `at://did:plc:xxx/app.bsky.feed.post/yyy`.

### Embed types to handle

- `app.bsky.embed.images#view` — `.images[]` with `.thumb`, `.fullsize`, `.alt`
- `app.bsky.embed.external#view` — `.external` with `.uri`, `.title`, `.description`, `.thumb`
- `app.bsky.embed.record#view` — quote post, `.record` contains author + value
- `app.bsky.embed.recordWithMedia#view` — quote + images combined

---

## Features to implement

### 1. Profile search
- Text input + "View Feed" button
- **Handle normalization**: if the input has no dots, append `.bsky.social` (e.g. `jay` → `jay.bsky.social`). Handles with dots are left as-is.
- Strip leading `@` if present
- Show profile card: banner, avatar, display name, handle, bio, follower/following/post counts

### 2. Feed display
- Show posts in a card layout with: author avatar + name + handle, post text, timestamp (relative: now/5m/3h/2d/Jan 5), images, link cards, quote posts, repost labels
- Filter bar with buttons: Posts, With Replies, Media, No Replies
- Cursor-based "Load more" pagination
- Posts are clickable (except links and images which do their own thing)

### 3. Thread view (click a post)
- Opens a **modal overlay** with blur backdrop
- Fetches `getPostThread` with `depth=10` and `parentHeight=80`
- **Ancestors** (upward): flatten the nested `parent` chain into a top-down list, shown with vertical connector lines between them
- **Focused post**: highlighted with a colored border and a label like "Viewing"
- **Replies** (downward): rendered recursively with nested indentation, sorted by like count
- Clicking any post in the thread re-fetches and re-centers on that post
- Close with Escape key, back button, or clicking the backdrop

### 4. URL query parameters
- Sync `?user=handle` and `&filter=value` to the URL using `history.replaceState`
- Only include `filter` param when it's not the default (`posts_and_author_threads`)
- On page load, read URL params and auto-load the profile + filter if present (makes URLs shareable/bookmarkable)

---

## Design direction

- **Single HTML file** — inline CSS + JS, no external frameworks
- **Fonts**: Google Fonts — use a serif display font for headings, a clean sans-serif for body text
- **Color palette**: sky blue accent tones + neutral slate grays. Use CSS custom properties.
- **Cards**: white background, subtle border, soft shadows, rounded corners (~14px)
- **Animations**: fade/slide-in for posts, smooth overlay transitions
- **Thread overlay**: fixed fullscreen with backdrop blur, scrollable, sticky back button
- **Thread connectors**: thin colored vertical lines between ancestor posts
- **Reply nesting**: left border + padding indent for nested replies
- **Responsive**: single-column, max-width ~640px, works on mobile

---

## Implementation notes

- All API calls are `fetch()` GET requests, no auth needed
- HTML-escape all user content before inserting into DOM (prevent XSS)
- Use `event.stopPropagation()` on links, images, and embed cards so clicking them doesn't trigger the thread overlay
- The `esc()` function should escape `& < > " '`
- The `linkify()` function should turn URLs in post text into clickable `<a>` tags
- Images in posts should open full-size in a new tab on click
- Quote posts inside embeds should stop click propagation

---

## File structure

```
bluesky-feed-viewer.html   ← everything in one file
```

That's it. Open in browser. Done.
