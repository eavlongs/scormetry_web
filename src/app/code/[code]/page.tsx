import { Button } from '@/components/ui/button'
import { getKeysFromValidationError } from '@/lib/utils'
import { KEYOF_ERR_USER_ALREADY_IN_CLASSROOM } from '@/types/response'
import { XIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { joinClassroomByCode } from './actions'

export default async function Page({ params }: { params: { code: string } }) {
    const { code } = await params

    const response = await joinClassroomByCode(code)

    if (response.success) {
        redirect(
            response.data
                ? `/classroom/${response.data.classroom.id}?success_message=${response.message}`
                : '/classroom'
        )
    }

    if (
        response.error &&
        getKeysFromValidationError(response.error).includes(
            KEYOF_ERR_USER_ALREADY_IN_CLASSROOM
        )
    ) {
        redirect(
            response.data
                ? `/classroom/${response.data.classroom.id}`
                : '/classroom'
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 mx-auto text-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-red-100 p-3">
                        <XIcon size={32} className="text-red-500" />
                    </div>
                </div>

                <p className="text-gray-600 mb-8">{response.message}</p>

                <div>
                    <Link href="/">
                        <Button className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
