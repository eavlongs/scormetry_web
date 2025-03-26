import { ClassroomUserDetail } from './auth'

export type Classroom = {
    id: string
    name: string
    color: ColorType
    code: string
}

export type ClassroomUsersResponse = {
    owner: ClassroomUserDetail
    teachers: ClassroomUserDetail[]
    judges: ClassroomUserDetail[]
    students: ClassroomUserDetail[]
}

export const colorMap = {
    red: 'bg-red-700',
    blue: 'bg-paragon',
    purple: 'bg-purple-900',
    green: 'bg-green-900',
    gray: 'bg-gray-900',
    brown: 'bg-amber-900',
}

export const classroomColors = Object.keys(colorMap) as ColorType[]

export type ColorType = keyof typeof colorMap

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
]

export type ClassroomRole =
    | typeof CLASSROOM_ROLE_TEACHER
    | typeof CLASSROOM_ROLE_JUDGE
    | typeof CLASSROOM_ROLE_STUDENT
