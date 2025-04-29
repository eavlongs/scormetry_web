import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Download, FileDown, Upload } from 'lucide-react'

export default function GradesTab({ classroom }) {
    const activities = classroom.activities || []
    const students = classroom.students || []

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Grades</CardTitle>
                        <CardDescription>
                            Manage and view student performance
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {activities.length > 0 && students.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">
                                        Student
                                    </TableHead>
                                    {activities.map((activity) => (
                                        <TableHead key={activity.id}>
                                            {activity.title}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">
                                        Average
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        {activities.map((activity) => (
                                            <TableCell
                                                key={`${student.id}-${activity.id}`}
                                            >
                                                {student.grades?.[
                                                    activity.id
                                                ] || '-'}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right">
                                            {calculateAverage(student.grades) ||
                                                '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileDown className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="text-xl font-semibold">
                            No grades available
                        </h3>
                        <p className="text-muted-foreground mt-1 mb-4">
                            Add activities and students to manage grades
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function calculateAverage(grades = {}) {
    if (!grades || Object.keys(grades).length === 0) return null

    const sum = Object.values(grades).reduce(
        (total, grade) => total + Number(grade),
        0
    )
    return (sum / Object.values(grades).length).toFixed(1)
}
