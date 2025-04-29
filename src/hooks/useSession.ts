import { AuthContext } from '@/app/AuthProvider'
import { useContext } from 'react'

export default function useSession() {
    const session = useContext(AuthContext)

    return session
}
