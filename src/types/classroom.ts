import { ClassroomUserDetail } from './auth'

export type Classroom = {
    id: string
    name: string
    color: ColorType
    code: string
    owned_by: string
}

export type ClassroomUsersResponse = {
    owner: ClassroomUserDetail
    teachers: ClassroomUserDetail[]
    judges: ClassroomUserDetail[]
    students: ClassroomUserDetail[]
}

export const CLASSROOM_COLORS = [
    'red',
    'blue',
    'purple',
    'green',
    'gray',
    'brown',
] as const

export type ColorType = (typeof CLASSROOM_COLORS)[number]

export const colorMap: Record<ColorType, string> = {
    red: 'bg-red-700',
    blue: 'bg-paragon',
    purple: 'bg-purple-900',
    green: 'bg-green-900',
    gray: 'bg-gray-900',
    brown: 'bg-amber-900',
}

export const classroomColorsWithType = Object.keys(colorMap) as ColorType[]

export const ClassroomRelationTeacher = 'As a Teacher'
export const ClassroomRelationStudent = 'As a Student'
export const ClassroomRelationJudge = 'As a Judge'

export const classroomRelations = [
    ClassroomRelationTeacher,
    ClassroomRelationJudge,
    ClassroomRelationStudent,
]
export type ClassroomRelationType =
    | typeof ClassroomRelationTeacher
    | typeof ClassroomRelationStudent
    | typeof ClassroomRelationJudge

export const CLASSROOM_ROLE_TEACHER = 'teacher'
export const CLASSROOM_ROLE_STUDENT = 'student'
export const CLASSROOM_ROLE_JUDGE = 'judge'

export const ALL_CLASSROOM_ROLES = [
    CLASSROOM_ROLE_TEACHER,
    CLASSROOM_ROLE_JUDGE,
    CLASSROOM_ROLE_STUDENT,
] as const

export type ClassroomRole =
    | typeof CLASSROOM_ROLE_TEACHER
    | typeof CLASSROOM_ROLE_JUDGE
    | typeof CLASSROOM_ROLE_STUDENT

export type Category = {
    id: string
    classroom_id: string
    name: string
    score_percentage: number
    created_at: string
    updated_at: string
}

export type Grouping = {
    id: string
    classroom_id: string
    name: string
    description: string
    is_default: boolean
    created_at: string
    updated_at: string
}

export type Group = {
    id: string
    name: string
    grouping_id: string
    created_at: string
    updated_at: string
}

export type GroupMember = {
    id: string
    group_id: string
    user_id: string
    created_at: string
    updated_at: string
}
