'use client'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { TextFileWriter } from '@/lib/text-file-writer'
import type { GetActivitiesResponse, GetGradeResponse } from '@/types/classroom'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect } from 'react'

export default function GradesTab({
    activities,
    grades,
}: {
    activities: GetActivitiesResponse
    grades: GetGradeResponse[]
}) {
    function exportData(fileType: 'csv' | 'xlsx') {
        const textFileWriter = new TextFileWriter(
            formatGradeData(),
            fileType,
            activities.classroom.name +
                ' grades ' +
                format(new Date(), 'yyyy-MM-dd,HH:mm:ss')
        )

        textFileWriter.write()
        textFileWriter.download()
    }

    useEffect(() => {
        exportData('xlsx')
    }, [])

    const formatGradeData = useCallback(() => {
        // Format the data into a structure that's suitable for CSV/Excel export
        const formattedData = grades.map((grade) => {
            // Start with student info
            const rowData: Record<string, any> = {
                'Student ID': grade.student.id,
                'Student Name': `${grade.student.first_name} ${grade.student.last_name}`,
                Email: grade.student.email,
            }

            // Add a column for each activity
            activities.activities.forEach((activity) => {
                const score = grade.student.grades.find(
                    (g) => g.activity_id === activity.id
                )
                rowData[activity.title] =
                    score && score.score ? score.score : ''
            })

            // Calculate average score
            const validScores = grade.student.grades
                .filter((g) => g.score !== undefined && g.score !== null)
                .map((g) => g.score as number)

            const average =
                validScores.length > 0
                    ? validScores.reduce((sum, score) => sum + score, 0) /
                      validScores.length
                    : 0

            rowData['Average Score'] = average.toFixed(1)

            return rowData
        })

        return formattedData
    }, [activities, grades])
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Grades</h2>
            </div>

            <div className="bg-background rounded-lg border">
                <div className="p-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead className="w-[300px] font-medium pl-8 text-base">
                                        Student
                                    </TableHead>
                                    {activities.activities.map((activity) => (
                                        <TableHead
                                            key={activity.id}
                                            className="font-medium text-center min-w-[150px] text-base"
                                        >
                                            <Link
                                                href={`/activity/${activity.id}`}
                                            >
                                                <span className="truncate block max-w-[180px] mx-auto">
                                                    {activity.title}
                                                </span>
                                            </Link>
                                        </TableHead>
                                    ))}
                                    <TableHead className="font-medium text-center pr-8 min-w-[120px] text-base">
                                        <Badge variant="paragon">
                                            Average Score
                                        </Badge>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grades.map((grade) => (
                                    <TableRow
                                        key={grade.student.id}
                                        className="h-16"
                                    >
                                        <TableCell className="font-medium text-base">
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="relative h-8 w-8 cursor-pointer">
                                                    <Image
                                                        src={
                                                            grade.student
                                                                .profile_picture
                                                        }
                                                        alt={
                                                            grade.student
                                                                .first_name +
                                                            ' ' +
                                                            grade.student
                                                                .last_name
                                                        }
                                                        fill
                                                        className="rounded-full aspect-square"
                                                    />
                                                </div>
                                                <span className="text-sm text-muted-foreground max-w-[15rem] line-clamp-1">
                                                    {grade.student.first_name +
                                                        ' ' +
                                                        grade.student.last_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {activities.activities.map(
                                            (activity) => {
                                                const score =
                                                    grade.student.grades.find(
                                                        (g) =>
                                                            g.activity_id ===
                                                            activity.id
                                                    )
                                                return (
                                                    <TableCell
                                                        key={activity.id}
                                                        className="text-center text-base"
                                                    >
                                                        <Link
                                                            href={`/activity/${activity.id}/score?sid=${grade.student.id}`}
                                                        >
                                                            {score &&
                                                            score.score ? (
                                                                <span className="font-medium">
                                                                    {
                                                                        score.score
                                                                    }
                                                                    %
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    --
                                                                </span>
                                                            )}
                                                        </Link>
                                                    </TableCell>
                                                )
                                            }
                                        )}
                                        <TableCell className="text-center pr-8 text-base font-medium">
                                            {/* {grade.student.class_average.toFixed(1)} */}
                                            80%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    )
}
