import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import { normalizeHandle } from './utils';
import { ProfileCard } from './components/ProfileCard';
import { FilterBar } from './components/FilterBar';
import { PostCard } from './components/PostCard';
import { ThreadOverlay } from './components/ThreadOverlay';
import './App.css';

export default function App() {
  const [handle, setHandle] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [currentActor, setCurrentActor] = useState('');
  const [filter, setFilter] = useState('posts_and_author_threads');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [threadUri, setThreadUri] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [thread, setThread] = useState<any>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  const filterRef = useRef(filter);
  filterRef.current = filter;

  const syncURL = useCallback((actor: string, f: string) => {
    const p = new URLSearchParams();
    if (actor) p.set('user', actor);
    if (f !== 'posts_and_author_threads') p.set('filter', f);
    const qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }, []);

  const loadProfile = useCallback(async (rawHandle: string, initialFilter?: string) => {
    const actor = normalizeHandle(rawHandle);
    const f = initialFilter || 'posts_and_author_threads';
    setCurrentActor(actor);
    setFilter(f);
    setProfile(null);
    setFeed([]);
    setCursor(null);
    setError(null);
    setProfileLoading(true);
    syncURL(actor, f);

    try {
      const p = await api('app.bsky.actor.getProfile', { actor });
      setProfile(p);
      setProfileLoading(false);

      setFeedLoading(true);
      const data = await api('app.bsky.feed.getAuthorFeed', { actor, limit: 30, filter: f });
      setFeed(data.feed);
      setCursor(data.cursor || null);
      setFeedLoading(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setProfileLoading(false);
      setFeedLoading(false);
    }
  }, [syncURL]);

  const loadMore = useCallback(async () => {
    if (!cursor || feedLoading) return;
    setFeedLoading(true);
    try {
      const data = await api('app.bsky.feed.getAuthorFeed', {
        actor: currentActor,
        limit: 30,
        filter: filterRef.current,
        cursor,
      });
      setFeed((prev) => [...prev, ...data.feed]);
      setCursor(data.cursor || null);
    } catch {
      // ignore
    }
    setFeedLoading(false);
  }, [cursor, feedLoading, currentActor]);

  const handleFilterChange = useCallback((f: string) => {
    setFilter(f);
    syncURL(currentActor, f);
    setFeed([]);
    setCursor(null);
    setFeedLoading(true);
    api('app.bsky.feed.getAuthorFeed', { actor: currentActor, limit: 30, filter: f })
      .then((data) => {
        setFeed(data.feed);
        setCursor(data.cursor || null);
        setFeedLoading(false);
      })
      .catch(() => setFeedLoading(false));
  }, [currentActor, syncURL]);

  const openThread = useCallback(async (uri: string) => {
    setThreadUri(uri);
    setThread(null);
    setThreadError(null);
    setThreadLoading(true);
    try {
      const data = await api('app.bsky.feed.getPostThread', { uri, depth: 10, parentHeight: 80 });
      setThread(data.thread);
    } catch (e: unknown) {
      setThreadError(e instanceof Error ? e.message : 'Unknown error');
    }
    setThreadLoading(false);
  }, []);

  const closeThread = useCallback(() => {
    setThreadUri(null);
    setThread(null);
    setThreadError(null);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const u = p.get('user');
    const f = p.get('filter');
    if (u) {
      setHandle(u);
      loadProfile(u, f || undefined);
    }
  }, [loadProfile]);

  const handleSubmit = () => {
    if (handle.trim()) loadProfile(handle);
  };

  return (
    <div className="container">
      <h1>Bluesky Feed Viewer</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter a Bluesky handle (e.g. jay)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <button className="btn" onClick={handleSubmit}>View Feed</button>
      </div>

      {profileLoading && <div className="status">Loading profile…</div>}
      {error && <div className="status">Could not load profile: {error}</div>}
      {profile && <ProfileCard profile={profile} />}
      {profile && <FilterBar current={filter} onChange={handleFilterChange} />}

      {feedLoading && feed.length === 0 && <div className="status">Loading feed…</div>}
      {!feedLoading && feed.length === 0 && profile && <div className="status">No posts found.</div>}

      {feed.map((item, i) => (
        <PostCard key={item.post.uri + i} item={item} index={i} onOpenThread={openThread} />
      ))}

      {cursor && (
        <div className="load-more-wrap">
          <button className="btn" onClick={loadMore} disabled={feedLoading}>
            {feedLoading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {threadUri && (
        <ThreadOverlay
          thread={thread}
          loading={threadLoading}
          error={threadError}
          onClose={closeThread}
          onOpenThread={openThread}
        />
      )}
    </div>
  );
}
