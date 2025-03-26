import { Button } from '@/components/ui/button'
import { KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION } from '@/types/response'
import { XIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { acceptInvitation } from './actions'
import ChangeAccountButton from './change-account-button'

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params

    const response = await acceptInvitation(id)
    console.log(response)

    if (response.success) {
        if (response.data)
            redirect(
                `/classroom/${response.data.classroom.id}?success_message=${response.message}`
            )
        redirect('/classroom')
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

                    {response.error &&
                        response.error.type ==
                            KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION && (
                            <div className="mt-4">
                                <ChangeAccountButton />
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}
