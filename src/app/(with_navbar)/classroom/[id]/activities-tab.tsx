'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Activity, Classroom } from '@/types/classroom'
import { FileTextIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { deleteActivity, getActivities } from './actions'
import { ActivityCard } from './activity-card'
import DeleteActivityDialog from './delete-activity-dialog'

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
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
        null
    )

    async function handleDeleteActivity(id: string) {
        const response = await deleteActivity(id, classroom.id)

        if (response.success) {
            setActivityToDelete(null)
            toast.success(response.message)
            return
        }

        toast.error(response.message)
    }

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
    }, [
        successMessage,
        errorMessage,
        pathname,
        router,
        showedErrorMessage,
        showedSuccessMessage,
    ])

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
                            onShowDeleteDialog={setActivityToDelete}
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

            <DeleteActivityDialog
                activity={activityToDelete}
                onClose={() => setActivityToDelete(null)}
                onDelete={handleDeleteActivity}
            />
        </>
    )
}
