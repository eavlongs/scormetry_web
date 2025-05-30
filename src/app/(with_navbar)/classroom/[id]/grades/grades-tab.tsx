'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { TextFileWriter } from '@/lib/text-file-writer'
import { formatDecimalNumber, generateFileNameForExport } from '@/lib/utils'
import type { GetActivitiesResponse, GetGradeResponse } from '@/types/classroom'
import { ChevronDown, FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'

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
            generateFileNameForExport(activities.classroom.name + ' grades')
        )

        textFileWriter.write()
        textFileWriter.download()
    }

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

            rowData['Average Score'] = formatDecimalNumber(average)

            return rowData
        })

        return formattedData
    }, [activities, grades])
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Grades</h2>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FileDown size={16} />
                                Export Data
                                <ChevronDown size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportData('csv')}>
                                <FileText size={16} className="mr-2" />
                                Export as CSV File
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => exportData('xlsx')}
                            >
                                <FileSpreadsheet size={16} className="mr-2" />
                                Export as Excel File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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
                                    <TableHead className="font-medium text-center pr-8 min-w-[120px] text-base">
                                        <Badge variant="paragon">
                                            Average Score
                                        </Badge>
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
                                        <TableCell className="text-center pr-8 text-base font-medium">
                                            {formatDecimalNumber(
                                                grade.student.overall_score
                                            )}
                                            %
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
                                                                    {formatDecimalNumber(
                                                                        score.score
                                                                    )}
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
