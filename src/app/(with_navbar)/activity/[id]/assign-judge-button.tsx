'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { UserPlus } from 'lucide-react'

export function AssignJudgeButton({ onClick }: { onClick: () => void }) {
    return (
        <SimpleToolTip text="Assign judge to this group">
            <UserPlus
                size={18}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
            />
        </SimpleToolTip>
    )
}
