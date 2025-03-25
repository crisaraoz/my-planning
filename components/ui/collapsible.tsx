'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';
import * as React from 'react';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden transition-all',
      'data-[state=closed]:animate-accordion-up', 
      'data-[state=open]:animate-accordion-down',
      'data-[state=open]:duration-700',
      'data-[state=open]:ease-[cubic-bezier(0.05,0.6,0.1,0.95)]',
      className
    )}
    {...props}
  />
));

CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
