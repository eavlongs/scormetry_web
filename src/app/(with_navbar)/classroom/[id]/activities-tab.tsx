'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Classroom } from '@/types/classroom'
import { formatDistanceToNow } from 'date-fns'
import { CalendarIcon, FileTextIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getActivities } from './actions'

export default function ActivitiesTab({
    classroom,
    activities,
    successMessage,
    errorMessage,
}: {
    classroom: Classroom
    activities: NonNullable<
        Awaited<ReturnType<typeof getActivities>>
    >['activities']
    successMessage: Readonly<string>
    errorMessage: Readonly<string>
}) {
    const [showedSuccessMessage, setShowedSuccessMessage] = useState(false)
    const [showedErrorMessage, setShowedErrorMessage] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (successMessage && !showedSuccessMessage) {
            toast.success(successMessage)
            setShowedSuccessMessage(true)
            router.replace(pathname)
        }

        if (errorMessage && !showedErrorMessage) {
            toast.error(errorMessage)
            setShowedErrorMessage(true)
            router.replace(pathname)
        }
    }, [successMessage, errorMessage, showedSuccessMessage, showedErrorMessage])

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Activities</h2>
                <Link href={`/classroom/${classroom.id}/activities/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Activity
                    </Button>
                </Link>
            </div>

            {activities.length > 0 ? (
                <div className="rounded-md border">
                    {activities.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            classroom={classroom}
                        />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-8">
                    <CardContent className="pt-6">
                        <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">
                            No activities yet
                        </h3>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                        <Link
                            href={`/classroom/${classroom.id}/activities/new`}
                        >
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Activity
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            )}
        </>
    )
}

function ActivityCard({
    activity,
    classroom,
}: {
    activity: NonNullable<
        Awaited<ReturnType<typeof getActivities>>
    >['activities'][0]
    classroom: Classroom
}) {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
        addSuffix: true,
    })

    return (
        <Link
            href={`/classroom/${classroom.id}/activites/${activity.id}`}
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b"
        >
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h3 className="font-medium line-clamp-1">
                        {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="relative h-6 w-6 cursor-pointer">
                            <Image
                                src={activity.posted_by_user.profile_picture}
                                alt={
                                    activity.posted_by_user.first_name +
                                    ' ' +
                                    activity.posted_by_user.last_name
                                }
                                fill
                                className="rounded-full"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {activity.posted_by_user.first_name +
                                ' ' +
                                activity.posted_by_user.last_name}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>{timeAgo}</span>
            </div>
        </Link>
    )
}
