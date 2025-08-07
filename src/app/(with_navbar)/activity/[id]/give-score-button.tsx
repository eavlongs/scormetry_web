'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { SquarePen } from 'lucide-react'
import Link from 'next/link'

export function GiveScoreButton({
    activityId,
    groupId = '',
    studentId = '',
    hasBeenGivenScore = false,
}: {
    activityId: string
    groupId?: string
    studentId?: string
    hasBeenGivenScore: boolean
}) {
    let searchParams = ''
    let entityName = ''
    if (studentId) {
        searchParams = `?sid=${studentId}`
        entityName = 'student'
    } else if (groupId) {
        searchParams = `?gid=${groupId}`
        entityName = 'group'
    }
    return (
        <SimpleToolTip
            text={
                hasBeenGivenScore
                    ? `Edit score for this ${entityName}`
                    : `Give score to this ${entityName}`
            }
        >
            <Link href={`/activity/${activityId}/score${searchParams}`}>
                <SquarePen
                    size={18}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    color={hasBeenGivenScore ? '#009900' : 'black'}
                />
            </Link>
        </SimpleToolTip>
    )
}
