import { linkify, relTime } from '../utils';
import { Embed } from './Embed';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Post({ post }: { post: any }) {
  const a = post.author;
  return (
    <>
      <div className="post-header">
        {a.avatar ? (
          <img className="post-avatar" src={a.avatar} alt="" />
        ) : (
          <div className="post-avatar" />
        )}
        <div>
          <div className="post-author-name">{a.displayName || a.handle}</div>
          <div className="post-author-handle">@{a.handle}</div>
        </div>
        <span className="post-time">
          {relTime(post.record?.createdAt || post.indexedAt)}
        </span>
      </div>
      {post.record?.text && (
        <div className="post-text">{linkify(post.record.text)}</div>
      )}
      <Embed embed={post.embed} />
    </>
  );
}
