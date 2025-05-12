import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import React from 'react'

export default function ConditionalScrollArea({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: React.ComponentProps<'div'>['className']
}) {
    return (
        <>
            {/* Mobile & Tablet: Show with scrolling (below md breakpoint) */}
            <ScrollArea className={cn('hidden lg:block', className)} dir="ltr">
                {children}
            </ScrollArea>

            {/* Desktop: Show without scrolling (md breakpoint and above) */}
            <div className="block lg:hidden">{children}</div>
        </>
    )
}
