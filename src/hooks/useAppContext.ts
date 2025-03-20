import { AppContext } from '@/app/AppProvider'
import { useContext } from 'react'

export default function useSession() {
    const appContext = useContext(AppContext)

    return appContext
}
