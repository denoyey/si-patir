import { useState } from 'react';

interface AvatarWithFallbackProps {
  username: string;
  name?: string;
  className?: string;
}

/**
 * Renders a developer's GitHub avatar with deterministic monogram fallback on load error.
 */
export function AvatarWithFallback({ username, name, className }: AvatarWithFallbackProps) {
  const [error, setError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : username.slice(0, 2).toUpperCase();

  const defaultClasses =
    'w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-zinc-300 dark:border-zinc-700 object-cover shrink-0 bg-zinc-200 dark:bg-zinc-800 shadow-xs';

  if (error || !username) {
    return (
      <div
        className={
          className ||
          'w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 shrink-0 shadow-xs'
        }
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://github.com/${username}.png?size=200`}
      alt={name || username}
      onError={() => setError(true)}
      className={className || defaultClasses}
      loading="lazy"
    />
  );
}
