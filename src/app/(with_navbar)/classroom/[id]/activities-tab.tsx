'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { CalendarIcon, FileTextIcon, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GetClassroomResponse } from './actions'

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
    const activities = [
        {
            id: '1',
            title: 'Quiz: Introduction to React',
            posted_by: {
                id: 'io132',
                name: 'John Doe',
                image: 'https://www.shutterstock.com/shutterstock/photos/2286554497/display_1500/stock-photo-random-pictures-cute-and-funny-2286554497.jpg',
            },
            created_at: new Date('2024-01-15'),
        },
        {
            id: '2',
            title: 'Assignment: Component Development',
            posted_by: {
                id: 'io132',
                name: 'John Doe',
                image: 'https://www.shutterstock.com/shutterstock/photos/2286554497/display_1500/stock-photo-random-pictures-cute-and-funny-2286554497.jpg',
            },
            created_at: new Date('2024-01-16'),
        },
        {
            id: '3',
            title: 'Discussion: State Management',
            posted_by: {
                id: 'io132',
                name: 'John Doe',
                image: 'https://www.shutterstock.com/shutterstock/photos/2286554497/display_1500/stock-photo-random-pictures-cute-and-funny-2286554497.jpg',
            },
            created_at: new Date('2024-01-17'),
        },
        {
            id: '4',
            title: 'Discussion: State Management',
            posted_by: {
                id: 'io132',
                name: 'John Doe',
                image: 'https://www.shutterstock.com/shutterstock/photos/2286554497/display_1500/stock-photo-random-pictures-cute-and-funny-2286554497.jpg',
            },
            created_at: new Date('2024-01-17'),
        },
    ]
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Activity
                </Button>
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
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Activity
                        </Button>
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
    activity: Activity
    classroom: GetClassroomResponse
}) {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
        addSuffix: true,
    })

    return (
        <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b">
            <div className="flex items-center gap-4">
                {/* <div
                    className={cn(
                        'min-w-[12px] h-12 rounded-sm',
                        colorMap[classroom.classroom.color]
                    )}
                ></div> */}
                <div className="flex flex-col">
                    <h3 className="font-medium line-clamp-1">
                        {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="h-5 w-5">
                            <AvatarImage
                                src={activity.posted_by.image}
                                alt={activity.posted_by.name}
                            />
                            <AvatarFallback>
                                {activity.posted_by.name[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                            {activity.posted_by.name}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>{timeAgo}</span>
            </div>
        </div>
    )
}
