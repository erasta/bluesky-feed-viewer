import { useEffect } from 'react';
import { Post } from './Post';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ThreadPost({ thread, focused, onOpenThread }: { thread: any; focused?: boolean; onOpenThread: (uri: string) => void }) {
  return (
    <div
      className={`thread-post${focused ? ' focused' : ''}`}
      onClick={focused ? undefined : () => onOpenThread(thread.post.uri)}
      style={focused ? undefined : { cursor: 'pointer' }}
    >
      {focused && <div className="focused-label">Viewing</div>}
      <Post post={thread.post} />
      <div className="post-likes">♡ {thread.post.likeCount || 0}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Replies({ replies, onOpenThread }: { replies: any[]; onOpenThread: (uri: string) => void }) {
  const sorted = [...replies]
    .filter((r) => r.post)
    .sort((a, b) => (b.post.likeCount || 0) - (a.post.likeCount || 0));

  return (
    <div className="thread-replies">
      {sorted.map((r) => (
        <div key={r.post.uri}>
          <div
            className="thread-post"
            onClick={(e) => { e.stopPropagation(); onOpenThread(r.post.uri); }}
            style={{ cursor: 'pointer' }}
          >
            <Post post={r.post} />
            <div className="post-likes">♡ {r.post.likeCount || 0}</div>
          </div>
          {r.replies?.length > 0 && <Replies replies={r.replies} onOpenThread={onOpenThread} />}
        </div>
      ))}
    </div>
  );
}

interface ThreadOverlayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thread: any;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onOpenThread: (uri: string) => void;
}

export function ThreadOverlay({ thread, loading, error, onClose, onOpenThread }: ThreadOverlayProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Flatten ancestors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ancestors: any[] = [];
  if (thread) {
    let node = thread.parent;
    while (node?.post) {
      ancestors.unshift(node);
      node = node.parent;
    }
  }

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="overlay-inner">
        <button className="overlay-back" onClick={onClose}>← Back</button>
        {loading && <div className="status">Loading thread…</div>}
        {error && <div className="status">Error: {error}</div>}
        {thread && (
          <>
            {ancestors.map((a) => (
              <div key={a.post.uri}>
                <ThreadPost thread={a} onOpenThread={onOpenThread} />
                <div className="thread-connector" />
              </div>
            ))}
            <ThreadPost thread={thread} focused onOpenThread={onOpenThread} />
            {thread.replies?.length > 0 && (
              <Replies replies={thread.replies} onOpenThread={onOpenThread} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
