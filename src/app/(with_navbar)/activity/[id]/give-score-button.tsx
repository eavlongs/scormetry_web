'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { SquarePen } from 'lucide-react'
import Link from 'next/link'

export function GiveScoreButton({ activityId }: { activityId: string }) {
    return (
        <SimpleToolTip text="Give score to this group">
            <Link href={`/activity/${activityId}/score`}>
                <SquarePen
                    size={18}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                />
            </Link>
        </SimpleToolTip>
    )
}
