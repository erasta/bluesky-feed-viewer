import type { ReactNode } from 'react';
import { createElement } from 'react';

export function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return createElement('a', {
        key: i,
        href: part,
        target: '_blank',
        rel: 'noopener',
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }, part);
    }
    return part;
  });
}

export function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function normalizeHandle(h: string): string {
  h = h.trim().replace(/^@/, '');
  if (!h.includes('.')) h += '.bsky.social';
  return h;
}
