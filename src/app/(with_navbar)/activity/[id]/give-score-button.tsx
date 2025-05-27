'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { SquarePen } from 'lucide-react'
import Link from 'next/link'

export function GiveScoreButton({
    activityId,
    groupId = '',
    studentId = '',
}: {
    activityId: string
    groupId?: string
    studentId?: string
}) {
    let searchParams = ''
    if (studentId) {
        searchParams = `?sid=${studentId}`
    } else if (groupId) {
        searchParams = `?gid=${groupId}`
    }
    return (
        <SimpleToolTip text="Give score to this group">
            <Link href={`/activity/${activityId}/score${searchParams}`}>
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
