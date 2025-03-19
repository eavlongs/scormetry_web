import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getClassroom } from './actions'
import ActivitiesTab from './activities-tab'
import ClassroomHeader from './classroom-header'
import GradesTab from './grades-tab'
import PeopleTab from './people-tab'

export default async function Page({
    params,
}: {
    params: {
        id: string
    }
}) {
    const { id } = await params
    const classroom = await getClassroom(id)

    if (!classroom) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Classroom Not Found</CardTitle>
                        <CardDescription>
                            The classroom you're looking for doesn't exist or
                            has been removed.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-6 space-y-6">
            <ClassroomHeader classroom={classroom} />

            <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="people">People</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>

                <TabsContent value="activities">
                    <ActivitiesTab classroom={classroom} />
                </TabsContent>

                <TabsContent value="people">
                    <PeopleTab classroom={classroom} />
                </TabsContent>

                <TabsContent value="grades">
                    <GradesTab classroom={classroom} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
