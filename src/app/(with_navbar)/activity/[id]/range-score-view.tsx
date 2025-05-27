'use client'

import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { getErrorMessageFromValidationError } from '@/lib/utils'
import { ScoringEntity } from '@/types/classroom'
import { ValidationError } from '@/types/response'
import Image from 'next/image'
import { ComponentProps, FocusEvent, useEffect, useState } from 'react'

export type RangeScore = {
    student_id: string
    score: number
}

export default function RangeScoreView({
    entity,
    initialScores,
    maxScore,
}: {
    initialScores: RangeScore[] | undefined
    entity: ScoringEntity
    maxScore: number
}) {
    const scores: RangeScore[] = initialScores ?? []

    return (
        <>
            {entity.type == 'individual' && (
                <ScoreInput
                    maxScore={maxScore}
                    value={
                        scores.find((s) => s.student_id === entity.entity.id)
                            ?.score
                    }
                />
            )}

            {entity.type == 'group' && (
                <div className="flex flex-col gap-y-4">
                    {entity.entity.users.map((student) => {
                        return (
                            <div
                                key={student.id}
                                className="flex flex-col gap-y-2"
                            >
                                <div className="flex items-center gap-x-2">
                                    <div className="relative h-8 w-8 cursor-pointer">
                                        <Image
                                            src={student.profile_picture}
                                            alt={
                                                student.first_name +
                                                ' ' +
                                                student.last_name
                                            }
                                            fill
                                            className="rounded-full"
                                        />
                                    </div>
                                    <span>
                                        {student.first_name +
                                            ' ' +
                                            student.last_name}
                                    </span>
                                </div>

                                <ScoreInput
                                    maxScore={maxScore}
                                    value={
                                        scores.find(
                                            (s) => s.student_id === student.id
                                        )?.score
                                    }
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}

function ScoreInput({
    maxScore,
    value,
}: {
    maxScore: number
    value?: number | string
}) {
    return (
        <LabelWrapper label={null} className="max-w-xs">
            <Input
                id="score"
                type="number"
                placeholder={`Enter score (0-${maxScore})`}
                value={value}
                readOnly
                className="hide-arrows"
            />
        </LabelWrapper>
    )
}
