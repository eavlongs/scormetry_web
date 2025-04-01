'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { CalendarIcon, Clock, FileTextIcon, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ActivitiesTab({
    classroom,
    successMessage,
    errorMessage,
}: {
    classroom: any
    successMessage: Readonly<string>
    errorMessage: Readonly<string>
}) {
    // Assuming classroom has an activities array
    const activities = classroom.activities || []
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Activities</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Activity
                </Button>
            </div>

            {activities.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-8">
                    <CardContent className="pt-6">
                        <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">
                            No activities yet
                        </h3>
                        <p className="text-muted-foreground mt-2">
                            Create your first activity for this classroom
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center pt-0">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Activity
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}

function ActivityCard({ activity }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription>{activity.type}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">{activity.description}</p>

                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span>Posted: {activity.createdAt}</span>

                    {activity.dueDate && (
                        <>
                            <Clock className="ml-3 mr-1 h-3 w-3" />
                            <span>Due: {activity.dueDate}</span>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    )
}
