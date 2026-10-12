import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { resolveMediaUrl } from '../../services/apiClient';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Plant photography',
  className = '',
  fallbackTitle = 'Botanical specimen',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedSrc = resolveMediaUrl(src);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-sage-100 text-sage-text p-4 border border-sage-200/60 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-botanical mb-2 shadow-natural-sm">
          <Leaf className="w-5 h-5 text-botanical" />
        </div>
        <span className="text-xs font-medium text-charcoal-muted text-center max-w-[140px] truncate">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-sage-50 ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 bg-sage-100/70 animate-pulse flex items-center justify-center">
          <Leaf className="w-6 h-6 text-botanical/40 animate-spin" />
        </div>
      ) : null}
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
};
