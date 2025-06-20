import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/session'
import { getKeysFromValidationError } from '@/lib/utils'
import { KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION } from '@/types/response'
import assert from 'assert'
import { XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { acceptInvitation } from './actions'
import ChangeAccountButton from './change-account-button'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const response = await acceptInvitation(id)
    const session = await getSession()

    assert(session, 'session should not be null')
    assert(session.user, 'session.user should not be null')

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

                <div className="mb-8">
                    <p className="text-gray-600">{response.message}</p>
                    {response.error &&
                        getKeysFromValidationError(response.error).includes(
                            KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION
                        ) && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <p className="text-gray-600">
                                    Currently logged in as:
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <div className="relative h-8 w-8 cursor-pointer">
                                        <Image
                                            src={session.user.profile_picture}
                                            alt={
                                                session.user.first_name +
                                                ' ' +
                                                session.user.last_name
                                            }
                                            fill
                                            className="rounded-full"
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {session.user.first_name +
                                            ' ' +
                                            session.user.last_name}
                                    </span>
                                </div>
                            </div>
                        )}
                </div>

                <div>
                    <Link href="/home">
                        <Button className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                            Return to Home
                        </Button>
                    </Link>

                    {response.error &&
                        getKeysFromValidationError(response.error).includes(
                            KEYOF_ERR_NOT_INTENDED_USER_FOR_INVITATION
                        ) && (
                            <div className="mt-4">
                                <ChangeAccountButton />
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}
