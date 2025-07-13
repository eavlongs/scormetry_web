import {
    GetRangeScoreFromAJudge,
    GetRubricScoreFromJudge,
    getScoresOfActivity,
} from '@/app/(with_navbar)/activity/[id]/actions'
import { GetClassroomResponse } from '@/app/(with_navbar)/classroom/[id]/actions'
import { RubricScoreSchema } from '@/schema'
import { UserEssentialDetail } from '@/types/auth'
import {
    GetActivity,
    GetRubric,
    classroomColorsWithType,
} from '@/types/classroom'
import { Prettify } from '@/types/general'
import {
    ActionResponse,
    NestedPathValidationError,
    VALIDATION_ERROR_MESSAGE,
    ValidationError,
} from '@/types/response'
import { type ClassValue, clsx } from 'clsx'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { ZodError, z } from 'zod'

import { TextFileWriter } from './text-file-writer'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getRandomColor() {
    return classroomColorsWithType[
        Math.floor(Math.random() * classroomColorsWithType.length)
    ]
}

/**
   client side only
*/
export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    } catch (err) {
        console.log(err)
        toast.error('Failed to copy')
    }
}

export async function copyUrlToClipboard(path: string) {
    const hostname = window.location.hostname
    const port = window.location.port

    let url = ''
    if (port != '' && port != '80' && port != '443') {
        url = `${hostname}:${port}${path}`
    } else {
        url = `${hostname}${path}`
    }

    await copyToClipboard(url)
}

export function formatDecimalNumber(num: number): string {
    if (Number.isInteger(num)) {
        return num.toString()
    } else {
        return num.toFixed(2)
    }
}

export function formatFileUrl(filePath: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/files?p=${filePath}`
}

export function generateFileNameForExport(name: string): string {
    return name + ' ' + format(new Date(), 'yyyy-MM-dd,HH:mm:ss')
}

export function convertZodErrorToValidationErrorWithNestedPath<T>(
    err: ZodError<T>,
    customPathMap: Record<string, string[]> = {}
): NestedPathValidationError[] {
    if (!(err instanceof ZodError)) return []

    const issues = err.issues
    const validationErrors: NestedPathValidationError[] = []

    for (const i in issues) {
        const path = issues[i].path

        if (!path) {
            validationErrors.push({
                field: [i + 1],
                message: issues[i].message,
            })
            continue
        }

        const p = customPathMap[path.join(',')] || path
        validationErrors.push({
            field: p,
            message: issues[i].message,
        })
    }

    return validationErrors
}

export function convertZodErrorToValidationError<T>(
    err: ZodError<T>
): ValidationError[] {
    if (!(err instanceof ZodError)) return []

    const issues = err.issues
    const validationErrors: ValidationError[] = []

    for (let i = 0; i < issues.length; i++) {
        const path = issues[i].path

        if (!path) {
            validationErrors.push({
                field: (i + 1).toString(),
                message: issues[i].message,
            })
            continue
        }

        let field = path[path.length - 1].toString()

        for (let i = path.length - 1; i >= 0; i--) {
            if (typeof path[i] === 'string') {
                field = path[i] as string
            }
        }

        validationErrors.push({
            field,
            message: issues[i].message,
        })
    }

    return validationErrors
}

export function getErrorMessageFromValidationErrorMultipleKeys(
    e: ValidationError[],
    keys: string[]
): string {
    for (const key of keys) {
        const error = e.find((error) => error.field === key)
        if (error) {
            return error.message
        }
    }
    return ''
}

export function getErrorMessageFromValidationError(
    e: ValidationError[],
    key: string
): string {
    const error = e.find((error) => error.field === key)
    if (error) {
        return error.message
    }
    return ''
}

export function getErrorMessageFromNestedPathValidationError(
    e: NestedPathValidationError[],
    key: (string | number)[]
): string {
    const error = e.find((e) => e.field.join('.') === key.join('.'))
    if (error) {
        return error.message
    }
    return ''
}

export function getKeysFromValidationError(e: ValidationError[]): string[] {
    return e.map((error) => error.field)
}

export function getValidationErrorActionResponse<T>(
    err: ZodError<T>
): ActionResponse {
    return {
        success: false,
        message: VALIDATION_ERROR_MESSAGE,
        error: convertZodErrorToValidationError(err),
    }
}

export function getValidationErrorWithNestedPathActionResponse<T>(
    err: ZodError<T>,
    customPathMap: Record<string, string[]> = {}
): ActionResponse<any, NestedPathValidationError[]> {
    return {
        success: false,
        message: VALIDATION_ERROR_MESSAGE,
        error: convertZodErrorToValidationErrorWithNestedPath(
            err,
            customPathMap
        ),
    }
}

export function getValidationErrorMessage(
    e: ValidationError[] | NestedPathValidationError[]
): string {
    return e.length > 0 ? e[0].message : ''
}

export function preventNonNumericInput(
    e: React.KeyboardEvent<HTMLInputElement>
) {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        return
    }
}

export function limitFloatInputDecimalPlaces(
    e: React.KeyboardEvent<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement | null>,
    maxDecimalPlaces: number
) {
    if (!ref.current) {
        return
    }

    const input = ref.current.value

    const decimalPointIndex = input.indexOf('.')

    if (decimalPointIndex === -1) {
        return
    }

    if (input.length - decimalPointIndex > maxDecimalPlaces) {
        e.preventDefault()
    }
}

export function calculateRubricScore(
    rubric: GetRubric,
    scores: z.infer<typeof RubricScoreSchema>[]
): {
    groupScore: number | null
    individualScores:
        | {
              student_id: string
              score: number
          }[]
        | null
    overallScore: number | null // null for implicit zero (the judge hasn't give any score)
} {
    if (!scores || scores.length === 0) {
        return {
            groupScore: null,
            individualScores: null,
            overallScore: null,
        }
    }

    // Get all unique student IDs from individual scores
    const studentIds = new Set<string>()
    scores.forEach((score) => {
        if (score.type === 'individual') {
            studentIds.add(score.assignee_id)
        }
    })

    // Organize scores by section, entity (group/student), and criteria
    const sectionScores = new Map<
        string,
        {
            isGroupScore: boolean
            weight: number
            maxScore: number
            groupScore: number | null
            studentScores: Map<string, number>
        }
    >()

    // Initialize section data
    for (const section of rubric.rubric_sections) {
        sectionScores.set(section.id, {
            isGroupScore: section.is_group_score,
            weight: section.score_percentage,
            maxScore: section.max_score,
            groupScore: null,
            studentScores: new Map<string, number>(),
        })
    }

    // Process all scores
    for (const score of scores) {
        for (const criteriaScore of score.scores) {
            // Find which section this criteria belongs to
            let sectionId = ''
            let criteriaData = null

            for (const section of rubric.rubric_sections) {
                for (const criteria of section.rubric_criterias) {
                    if (criteria.id === criteriaScore.rubric_criteria_id) {
                        sectionId = section.id
                        criteriaData = criteria
                        break
                    }
                }
                if (sectionId) break
            }

            if (!sectionId || !criteriaData) continue

            const sectionData = sectionScores.get(sectionId)!

            if (score.type === 'group' && sectionData.isGroupScore) {
                // Handle group score
                const currentScore = sectionData.groupScore || 0
                sectionData.groupScore = currentScore + criteriaScore.score
            } else if (
                score.type === 'individual' &&
                !sectionData.isGroupScore
            ) {
                // Handle individual score
                const studentId = score.assignee_id
                const currentScore =
                    sectionData.studentScores.get(studentId) || 0
                sectionData.studentScores.set(
                    studentId,
                    currentScore + criteriaScore.score
                )
            }
        }
    }

    // Calculate final scores
    let groupScore: number | null = null
    let individualScores: { student_id: string; score: number }[] = []

    if (rubric.has_weightage) {
        // With weightage - apply section weights

        // Calculate group score with weightage
        let totalGroupWeightedScore = 0
        let totalGroupWeight = 0

        for (const [_, sectionData] of sectionScores) {
            if (sectionData.isGroupScore && sectionData.groupScore !== null) {
                totalGroupWeightedScore +=
                    (sectionData.groupScore / sectionData.maxScore) *
                    sectionData.weight
                totalGroupWeight += sectionData.weight
            }
        }

        if (totalGroupWeight > 0) {
            groupScore = totalGroupWeightedScore
        }

        // Calculate individual scores with weightage
        for (const studentId of studentIds) {
            let totalStudentWeightedScore = 0
            let totalStudentWeight = 0

            for (const [_, sectionData] of sectionScores) {
                if (
                    sectionData.isGroupScore &&
                    sectionData.groupScore !== null
                ) {
                    // Add weighted group score
                    totalStudentWeightedScore +=
                        (sectionData.groupScore / sectionData.maxScore) *
                        sectionData.weight
                    totalStudentWeight += sectionData.weight
                } else if (
                    !sectionData.isGroupScore &&
                    sectionData.studentScores.has(studentId)
                ) {
                    // Add weighted individual score
                    const studentScore =
                        sectionData.studentScores.get(studentId)!
                    totalStudentWeightedScore +=
                        (studentScore / sectionData.maxScore) *
                        sectionData.weight
                    totalStudentWeight += sectionData.weight
                }
            }

            if (totalStudentWeight > 0) {
                individualScores.push({
                    student_id: studentId,
                    score: totalStudentWeightedScore,
                })
            }
        }
    } else {
        // Without weightage - just sum and divide by max possible
        let totalMaxScore = rubric.max_score

        // Calculate group score
        let totalGroupScore = 0
        for (const [_, sectionData] of sectionScores) {
            if (sectionData.isGroupScore && sectionData.groupScore !== null) {
                totalGroupScore += sectionData.groupScore
            }
        }

        // Calculate individual scores
        for (const studentId of studentIds) {
            let totalStudentScore = 0

            for (const [_, sectionData] of sectionScores) {
                if (
                    sectionData.isGroupScore &&
                    sectionData.groupScore !== null
                ) {
                    // Add group score
                    totalStudentScore += sectionData.groupScore
                } else if (
                    !sectionData.isGroupScore &&
                    sectionData.studentScores.has(studentId)
                ) {
                    // Add individual score
                    totalStudentScore +=
                        sectionData.studentScores.get(studentId)!
                }
            }

            if (totalMaxScore > 0) {
                // Convert to percentage
                individualScores.push({
                    student_id: studentId,
                    score: (totalStudentScore / totalMaxScore) * 100,
                })
            }
        }

        if (totalMaxScore > 0 && totalGroupScore > 0) {
            // Convert to percentage
            groupScore = (totalGroupScore / totalMaxScore) * 100
        }
    }

    // Calculate overall score (average of individual scores)
    let overallScore: number | null = null
    if (individualScores.length > 0) {
        const total = individualScores.reduce(
            (sum, score) => sum + score.score,
            0
        )
        overallScore = total / individualScores.length
    }

    if (
        (groupScore && groupScore > 100) ||
        (individualScores &&
            individualScores.findIndex((is) => is.score > 100) !== -1) ||
        (overallScore && overallScore > 100)
    ) {
        return {
            groupScore: null,
            individualScores: null,
            overallScore: null,
        }
    }

    return {
        groupScore,
        individualScores: individualScores.length > 0 ? individualScores : null,
        overallScore,
    }
}

export async function exportData(
    classroom: GetClassroomResponse,
    activity: GetActivity,
    fileType: 'csv' | 'xlsx',
    mode: 'detailed' | 'final'
) {
    if (activity.scoring_type === null) return

    if (
        activity.scoring_type !== 'range' &&
        activity.scoring_type !== 'rubric'
    ) {
        throw new Error('scoring type not supported')
    }

    if (mode == 'detailed') {
        const response = await getScoresOfActivity(
            activity.id,
            activity.scoring_type
        )

        if (!response.success) {
            toast.error(response.message)
            return
        }

        const data = formatDetailedScore(classroom, activity, response.data!)

        const textFileWriter = new TextFileWriter(
            data,
            fileType,
            generateFileNameForExport(activity.title + ' grades')
        )

        textFileWriter.write()
        textFileWriter.download()
    } else {
        const data = formatFinalScore(classroom, activity)
        const textFileWriter = new TextFileWriter(
            data,
            fileType,
            generateFileNameForExport(activity.title + ' grades')
        )

        textFileWriter.write()
        textFileWriter.download()
    }
}

function formatDetailedScore(
    classroom: GetClassroomResponse,
    activity: GetActivity,
    data: Prettify<
        NonNullable<Awaited<ReturnType<typeof getScoresOfActivity>>['data']>
    >
) {
    const allStudents = classroom.people.students
    const students = allStudents.filter((s) => s.first_name)

    if (!activity.students) {
        toast.error(
            'Failed to get data to export. Please refresh and try again'
        )
        throw new Error(
            'Failed to get data to export. Please refresh and try again'
        )
    }

    let result = []

    if (activity.scoring_type == 'rubric') {
        if (activity.rubric_id == null || !activity.rubric) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }

        const sections = activity.rubric.rubric_sections

        for (const student of students) {
            const initalData: Record<string, any> = {
                'Student ID': student.id,
                'Student Name': `${student.first_name} ${student.last_name}`,
                Email: student.email,
            }

            let judges: UserEssentialDetail[] = []
            if (activity.grouping_id != null && activity.groups) {
                const group = activity.groups.find((g) =>
                    g.users.find((u) => u.id == student.id)
                )

                judges = group ? group.judges : []
            } else {
                judges =
                    activity.students.find((s) => s.id == student.id)?.judges ??
                    []
            }

            const tmp = data.find((d) => d.student.id == student.id)
            const scores = tmp
                ? (tmp.score_data as GetRubricScoreFromJudge[])
                : []

            // since there will always at least one row, we will set the one row outside the loop
            const firstRowData: Record<string, any> = {
                ...initalData,
                'Judge Name':
                    judges && judges.length > 0
                        ? `${judges[0].first_name} ${judges[0].last_name}`
                        : '',
                'Judge Email':
                    judges && judges.length > 0 ? judges[0].email : '',
                ...generateRubricScoreRow(
                    sections,
                    judges && judges.length > 0
                        ? (scores.find((s) => s.judge.id == judges[0].id)
                              ?.scores ?? [])
                        : []
                ),
            }

            result.push(firstRowData)

            for (let i = 1; i < judges.length; i++) {
                const _data: Record<string, any> = {
                    ...initalData,
                    'Judge Name': `${judges[i].first_name} ${judges[i].last_name}`,
                    'Judge Email': judges[i].email,
                    ...generateRubricScoreRow(
                        sections,
                        scores.find((s) => s.judge.id == judges[i].id)
                            ?.scores ?? []
                    ),
                }

                result.push(_data)
            }
        }
    } else {
        if (!activity.max_score) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }

        for (const student of students) {
            const initalData: Record<string, any> = {
                'Student ID': student.id,
                'Student Name': `${student.first_name} ${student.last_name}`,
                Email: student.email,
            }

            let judges: UserEssentialDetail[] = []
            if (activity.grouping_id != null && activity.groups) {
                const group = activity.groups.find((g) =>
                    g.users.find((u) => u.id == student.id)
                )

                judges = group ? group.judges : []
            } else {
                judges =
                    activity.students.find((s) => s.id == student.id)?.judges ??
                    []
            }

            const tmp = data.find((d) => d.student.id == student.id)
            const scores = tmp
                ? (tmp.score_data as GetRangeScoreFromAJudge[])
                : []

            // since there will always at least one row, we will set the one row outside the loop
            const firstRowData: Record<string, any> = {
                ...initalData,
                'Judge Name':
                    judges && judges.length > 0
                        ? `${judges[0].first_name} ${judges[0].last_name}`
                        : '',
                'Judge Email':
                    judges && judges.length > 0 ? judges[0].email : '',
                'Given Score':
                    judges && judges.length > 0
                        ? (scores.find((s) => s.judge.id == judges[0].id)
                              ?.score ?? '')
                        : '',
                'Max Score': activity.max_score,
            }

            result.push(firstRowData)

            for (let i = 1; i < judges.length; i++) {
                const _data: Record<string, any> = {
                    ...initalData,
                    'Judge Name': `${judges[i].first_name} ${judges[i].last_name}`,
                    'Judge Email': judges[i].email,
                    'Given Score':
                        scores.find((s) => s.judge.id == judges[i].id)?.score ??
                        '',
                    'Max Score': activity.max_score,
                }

                result.push(_data)
            }
        }
    }
    return result
}

function formatFinalScore(
    classroom: GetClassroomResponse,
    activity: GetActivity
) {
    const allStudents = classroom.people.students
    const students = allStudents.filter((s) => s.first_name)

    if (!activity.students) {
        toast.error(
            'Failed to get data to export. Please refresh and try again'
        )
        throw new Error(
            'Failed to get data to export. Please refresh and try again'
        )
    }

    let data = []

    if (activity.scoring_type == 'rubric') {
        if (activity.rubric_id == null || !activity.rubric) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }

        for (const student of students) {
            let judges: UserEssentialDetail[] = []
            if (activity.grouping_id != null && activity.groups) {
                const group = activity.groups.find((g) =>
                    g.users.find((u) => u.id == student.id)
                )

                judges = group ? group.judges : []
            } else {
                judges =
                    activity.students.find((s) => s.id == student.id)?.judges ??
                    []
            }

            let scorePercentage: number | string = ''

            if (activity.grouping_id != null && activity.groups) {
                const tmp = activity.groups
                    .flatMap((g) => g.users)
                    .find((u) => u.id == student.id)

                scorePercentage =
                    tmp && tmp.score_percentage !== null
                        ? tmp.score_percentage
                        : ''
            } else {
                const tmp = activity.students.find((s) => s.id == student.id)

                scorePercentage =
                    tmp && tmp.score_percentage !== null
                        ? tmp.score_percentage
                        : ''
            }

            const rowData: Record<string, any> = {
                'Student ID': student.id,
                'Student Name': `${student.first_name} ${student.last_name}`,
                Email: student.email,
                Percentage:
                    typeof scorePercentage == 'number'
                        ? formatDecimalNumber(scorePercentage) + '%'
                        : '',
                Judges: judges
                    .map((j) => `${j.first_name} ${j.last_name}`)
                    .join(', '),
            }
            data.push(rowData)
        }
    } else {
        if (!activity.max_score) {
            toast.error(
                'Failed to get data to export. Please refresh and try again'
            )
            throw new Error(
                'Failed to get data to export. Please refresh and try again'
            )
        }
        for (const student of students) {
            let judges: UserEssentialDetail[] = []
            if (activity.grouping_id != null && activity.groups) {
                const group = activity.groups.find((g) =>
                    g.users.find((u) => u.id == student.id)
                )

                judges = group ? group.judges : []
            } else {
                judges =
                    activity.students.find((s) => s.id == student.id)?.judges ??
                    []
            }

            let score: number | string = ''

            if (activity.grouping_id != null && activity.groups) {
                const tmp = activity.groups
                    .flatMap((g) => g.users)
                    .find((u) => u.id == student.id)

                score = tmp && tmp.score !== null ? tmp.score : ''
            } else {
                const tmp = activity.students.find((s) => s.id == student.id)

                score = tmp && tmp.score !== null ? tmp.score : ''
            }

            const rowData: Record<string, any> = {
                'Student ID': student.id,
                'Student Name': `${student.first_name} ${student.last_name}`,
                Email: student.email,
                'Final Score': score,
                'Max Score': activity.max_score,
                Percentage:
                    typeof score == 'number'
                        ? formatDecimalNumber(
                              (score / activity.max_score) * 100
                          ) + '%'
                        : '',
                Judges: judges
                    .map((j) => `${j.first_name} ${j.last_name}`)
                    .join(', '),
            }

            data.push(rowData)
        }
    }
    return data
}

function generateRubricScoreRow(
    sections: GetRubric['rubric_sections'],
    scoresFromJudge: GetRubricScoreFromJudge['scores']
) {
    const result: Record<string, any> = {}

    const fieldNameMentions: Record<string, number> = {}

    for (const section of sections) {
        for (const criteria of section.rubric_criterias) {
            const scoreInCriteria = scoresFromJudge.find(
                (cs) => cs.rubric_criteria_id == criteria.id
            )

            let outputStr = ''
            if (scoreInCriteria !== undefined) {
                outputStr = `${scoreInCriteria.score} / ${criteria.max_score}`
            } else {
                outputStr = `-/${criteria.max_score}`
            }

            let fieldName = `${section.name} - ${criteria.name}`
            const timesFieldNameMentioned = fieldNameMentions[fieldName]

            if (timesFieldNameMentioned === undefined) {
                fieldNameMentions[fieldName] = 1
            } else {
                fieldNameMentions[fieldName] = timesFieldNameMentioned + 1
                fieldName += '_' + timesFieldNameMentioned
            }
            result[fieldName] = outputStr
        }
    }

    return result
}
