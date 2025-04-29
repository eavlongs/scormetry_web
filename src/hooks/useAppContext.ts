import { AppContext } from '@/app/AppProvider'
import { useContext } from 'react'

export default function useAppContext() {
    const appContext = useContext(AppContext)

    return appContext
}
