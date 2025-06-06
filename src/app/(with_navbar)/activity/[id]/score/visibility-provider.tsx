'use client'

import React from 'react'

export type ScoreInputVisibilityContextType = {
    hideScore: boolean
    show: () => void
}

const scoreInputvisibilityContextDefaultValue: ScoreInputVisibilityContextType =
    {
        hideScore: false,
        show: () => {},
    }

const ScoreInputVisibilityContext =
    React.createContext<ScoreInputVisibilityContextType>(
        scoreInputvisibilityContextDefaultValue
    )

export function ScoreInputVisibilityProvider({
    value,
    children,
}: {
    value: ScoreInputVisibilityContextType
    children: React.ReactNode
}) {
    return (
        <ScoreInputVisibilityContext.Provider value={value}>
            {children}
        </ScoreInputVisibilityContext.Provider>
    )
}

export function useScoreInputVisibilityContext() {
    const context = React.useContext(ScoreInputVisibilityContext)
    if (context === undefined) {
        throw new Error(
            'useVisibilityContext must be used within a VisibilityProvider'
        )
    }
    return context
}
