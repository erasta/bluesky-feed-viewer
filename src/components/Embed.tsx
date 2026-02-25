import { linkify } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Images({ images }: { images: any[] }) {
  const n = images.length;
  return (
    <div className={`post-images img-${Math.min(n, 4)}`}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.thumb}
          alt={img.alt || ''}
          loading="lazy"
          onClick={(e) => {
            e.stopPropagation();
            window.open(img.fullsize, '_blank');
          }}
        />
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function External({ ext }: { ext: any }) {
  let host = '';
  try { host = new URL(ext.uri).hostname; } catch { /* ignore */ }
  return (
    <a
      className="link-card"
      href={ext.uri}
      target="_blank"
      rel="noopener"
      onClick={(e) => e.stopPropagation()}
    >
      {ext.thumb && <img className="link-card-thumb" src={ext.thumb} alt="" loading="lazy" />}
      <div className="link-card-body">
        <div className="link-card-title">{ext.title}</div>
        <div className="link-card-desc">{ext.description}</div>
        <div className="link-card-url">{host}</div>
      </div>
    </a>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Quote({ record, onOpenThread }: { record: any; onOpenThread: (uri: string) => void }) {
  if (!record || record.$type === 'app.bsky.embed.record#viewNotFound') return null;
  const a = record.author;
  if (!a) return null;
  return (
    <div className="quote-card" onClick={(e) => { e.stopPropagation(); onOpenThread(record.uri); }}>
      <div className="post-header">
        {a.avatar && <img className="post-avatar" src={a.avatar} alt="" style={{ width: 24, height: 24 }} />}
        <div>
          <span className="post-author-name" style={{ fontSize: '.82rem' }}>{a.displayName || a.handle}</span>{' '}
          <span className="post-author-handle" style={{ fontSize: '.75rem' }}>@{a.handle}</span>
        </div>
      </div>
      {record.value?.text && <div className="post-text">{linkify(record.value.text)}</div>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Embed({ embed, onOpenThread }: { embed: any; onOpenThread?: (uri: string) => void }) {
  if (!embed) return null;
  const openThread = onOpenThread || (() => {});
  const t = embed.$type;

  if (t === 'app.bsky.embed.images#view') return <Images images={embed.images} />;
  if (t === 'app.bsky.embed.external#view') return <External ext={embed.external} />;
  if (t === 'app.bsky.embed.record#view') return <Quote record={embed.record} onOpenThread={openThread} />;
  if (t === 'app.bsky.embed.recordWithMedia#view') {
    return (
      <>
        {embed.media?.$type === 'app.bsky.embed.images#view' && <Images images={embed.media.images} />}
        {embed.media?.$type === 'app.bsky.embed.external#view' && <External ext={embed.media.external} />}
        {embed.record && <Quote record={embed.record.record || embed.record} onOpenThread={openThread} />}
      </>
    );
  }
  return null;
}
