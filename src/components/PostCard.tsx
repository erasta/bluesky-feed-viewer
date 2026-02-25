import { Post } from './Post';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostCard({ item, index, onOpenThread }: { item: any; index: number; onOpenThread: (uri: string) => void }) {
  const post = item.post;
  const reason = item.reason;
  const isRepost = reason && reason.$type === 'app.bsky.feed.defs#reasonRepost';

  return (
    <div
      className="post-card"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => onOpenThread(post.uri)}
    >
      {isRepost && (
        <div className="repost-label">
          ↻ Reposted by {reason.by.displayName || reason.by.handle}
        </div>
      )}
      <Post post={post} />
    </div>
  );
}
