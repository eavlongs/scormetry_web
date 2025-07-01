'use client'

import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useState,
} from 'react'

export type AppContextType = {
    createClassroomDialogOpen: boolean
    setCreateClassroomDialog: Dispatch<SetStateAction<boolean>>
}

const appContextDefaultValue: AppContextType = {
    createClassroomDialogOpen: false,
    setCreateClassroomDialog: () => {},
}

export const AppContext = createContext<AppContextType>(appContextDefaultValue)

export default function AppProvider({
    children,
}: {
    children: Readonly<ReactNode>
}) {
    const [createClassroomDialogOpen, setCreateClassroomDialog] =
        useState(false)

    return (
        <AppContext.Provider
            value={{ createClassroomDialogOpen, setCreateClassroomDialog }}
        >
            {children}
        </AppContext.Provider>
    )
}
