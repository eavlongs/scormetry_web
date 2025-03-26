import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function ClassroomNotFound() {
    return (
        <div className="flex items-center justify-center h-[70vh]">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Classroom Not Found</CardTitle>
                    <CardDescription>
                        The classroom you're looking for doesn't exist or has
                        been removed.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
