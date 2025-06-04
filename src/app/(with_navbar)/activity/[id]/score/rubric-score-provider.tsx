'use client'

import { RubricScoreSchema } from '@/schema'
import { IndividualOrGroup } from '@/types/classroom'
import { NestedPathValidationError } from '@/types/response'
import React from 'react'
import { z } from 'zod'

export type RubricScoreContextType = {
    // activity_assignment_id: string | null
    initialScores: z.infer<typeof RubricScoreSchema>[]
    assignment_type: IndividualOrGroup | null
    scores: z.infer<typeof RubricScoreSchema>[]
    errors: NestedPathValidationError[]

    updateScore: (
        id: string,
        type: IndividualOrGroup,
        criteria_id: string,
        score: string
    ) => void
    setErrors: React.Dispatch<React.SetStateAction<NestedPathValidationError[]>>
    addOrReplaceError: (error: NestedPathValidationError) => void
    removeError: (path: NestedPathValidationError['field']) => void
}

const rubricScoreContextDefaultValue: RubricScoreContextType = {
    // activity_assignment_id: null,
    initialScores: [],
    assignment_type: null,
    scores: [],
    errors: [],

    updateScore: () => {},
    setErrors: () => {},
    addOrReplaceError: () => {},
    removeError: () => {},
}

const RubricScoreContext = React.createContext<RubricScoreContextType>(
    rubricScoreContextDefaultValue
)

export function RubricScoreProvider({
    value,
    children,
}: {
    value: RubricScoreContextType
    children: React.ReactNode
}) {
    return (
        <RubricScoreContext.Provider value={value}>
            {children}
        </RubricScoreContext.Provider>
    )
}

export function useRubricScoreContext() {
    const context = React.useContext(RubricScoreContext)
    if (context === undefined) {
        throw new Error(
            'useRubricScoreContext must be used within a RubricScoreProvider'
        )
    }
    return context
}
