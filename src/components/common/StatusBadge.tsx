import React from 'react';
import { PlantStatus } from '../../types/garden';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PlantStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'healthy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-alert-successBg text-alert-success border border-alert-successBorder ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>Looking healthy</span>
        </span>
      );
    case 'attention':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-terracotta-subtle text-terracotta border border-terracotta-border ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
          }`}
        >
          <AlertCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>Needs attention</span>
        </span>
      );
    case 'needs_info':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sage-100 text-charcoal-muted border border-sage-200 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
          }`}
        >
          <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
          <span>Care info needed</span>
        </span>
      );
  }
};
