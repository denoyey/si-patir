import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableDescriptionProps {
  /** The full description text */
  text: string;
  /** Maximum length before truncation. Defaults to 70 characters. */
  previewLength?: number;
  /** Optional container CSS class */
  className?: string;
}

/**
 * Clean, accessible expand/collapse description component.
 * Allows toggling between a concise truncated preview with "..." and full text
 * using "Lebih banyak" / "Lebih sedikit" controls for optimal mobile & desktop UX.
 */
export function ExpandableDescription({
  text,
  previewLength = 70,
  className = '',
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If text is within length, render without toggle controls
  if (!text || text.length <= previewLength) {
    return (
      <p className={`text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed ${className}`}>
        {text}
      </p>
    );
  }

  // Calculate clean word-boundary truncation
  const truncatedPreview = (() => {
    const raw = text.slice(0, previewLength);
    const lastSpace = raw.lastIndexOf(' ');
    const boundary = (lastSpace > 25 ? raw.slice(0, lastSpace) : raw).trim();
    return boundary.replace(/[,.;:\s]+$/, '');
  })();

  return (
    <div className={`text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed transition-all duration-200 ${className}`}>
      <span>{isExpanded ? text : truncatedPreview}</span>
      {!isExpanded && <span className="text-zinc-400 dark:text-zinc-500 font-medium">... </span>}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="inline-flex items-center gap-0.5 ml-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer select-none touch-manipulation active:scale-95 focus:outline-hidden"
        title={isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
      >
        <span>{isExpanded ? 'Lebih sedikit' : 'Lebih banyak'}</span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 shrink-0 inline-block opacity-80" />
        ) : (
          <ChevronDown className="w-3 h-3 shrink-0 inline-block opacity-80" />
        )}
      </button>
    </div>
  );
}

