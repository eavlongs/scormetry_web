'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'

export function AssignJudgeButton({
    onClick,
    ...props
}: {
    onClick: () => void
    props?: React.ComponentProps<'button'>
}) {
    return (
        <SimpleToolTip text="Assign judge to this group">
            <Button
                variant="outline"
                className="ml-auto p-2"
                asChild
                {...props}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
            >
                <div>
                    {/* <Users className="h-5 w-5" /> */}
                    Assign
                </div>
            </Button>
        </SimpleToolTip>
    )
}
