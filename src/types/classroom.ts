import { ClassroomUserDetail, UserEssentialDetail } from './auth'
import { Prettify } from './general'

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

export const SCORING_TYPE_RANGE = 'range'
export const SCORING_TYPE_RUBRIC = 'rubric'

export const SCORING_TYPES = [SCORING_TYPE_RANGE, SCORING_TYPE_RUBRIC] as const

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

export type Activity = {
    id: string
    classroom_id: string
    title: string
    description: string
    category_id: string | null
    grouping_id: string | null
    rubric_id: string | null
    scoring_type: string | null
    max_score: number | null
    posted_by: string
    files: CustomFile[]
    hide_score: boolean
    created_at: string
    updated_at: string
}

export type CustomFile = {
    id: string
    file_path: string
    file_name: string
    file_size: number
    content_type: string
    created_at: string
}

export type GetGroup = Pick<Group, 'id' | 'name' | 'grouping_id'> & {
    users: UserEssentialDetail[]
    judges: UserEssentialDetail[]
}

export type GetGroupWithScoreInfo = Prettify<
    Pick<GetGroup, 'id' | 'name' | 'grouping_id' | 'judges'> & {
        score: number | null
        score_percentage: number | null
        users: (UserEssentialDetail & {
            score: number | null
            score_percentage: number | null
        })[]
    }
>

export type GetGroupWithJudgePermission = GetGroupWithScoreInfo & {
    activity_assignment_id: string
    permitted_to_judge: boolean
    all_judge_scored: boolean
}

export type GetActivity = Activity & {
    rubric: GetRubric | null
    posted_by_user: ClassroomUserDetail
    groups: GetGroupWithJudgePermission[] | null
    students:
        | Prettify<
              UserEssentialDetail & {
                  activity_assignment_id: string
                  permitted_to_judge: boolean
                  judges: UserEssentialDetail[]
                  score: number | null
                  score_percentage: number | null
                  all_judge_scored: boolean
              }
          >[]
        | null
    judges: UserEssentialDetail[] | null
    group:
        | (GetGroupWithScoreInfo & {
              activity_assignment_id: string
          })
        | null
    student: StudentWithScoreDetail | null
}

export type StudentWithScoreDetail = UserEssentialDetail & {
    judges: UserEssentialDetail[]
    score: number | null
    score_percentage: number | null
    activity_assignment_id: string
}

export type GetRubricInClassroomResponse = GetRubric & {
    activity_name: string
}

export type GetRubric = Rubric & {
    rubric_sections: (RubricSection & {
        rubric_criterias: (RubricCriteria & {
            criteria_score_ranges: CriteriaScoreRange[]
        })[]
    })[]
}

export type Rubric = {
    id: string
    has_weightage: boolean
    max_score: number
    note: string
    created_at: string
    updated_at: string
}

export type RubricSection = {
    id: string
    rubric_id: string
    name: string
    description: string
    is_group_score: boolean
    score_percentage: number
    max_score: number
    order: number
    created_at: string
    updated_at: string
}

export type RubricCriteria = {
    id: string
    rubric_section_id: string
    name: string
    min_score: number
    max_score: number
    order: number
    created_at: string
    updated_at: string
}

export type GetActivitiesResponse = {
    classroom: Classroom & {
        role: ClassroomRole
    }
    activities: (Activity & {
        posted_by_user: UserEssentialDetail
    })[]
}

export type CriteriaScoreRange = {
    id: string
    rubric_criteria_id: string
    name: string
    description: string
    min_score: number
    max_score: number
    created_at: string
    updated_at: string
}

export type ScoringEntity = {
    isScored: boolean
} & (
    | {
          type: 'group'
          activity_assignment_id: string
          entity: GetGroup
      }
    | {
          type: 'individual'
          activity_assignment_id: string
          entity: UserEssentialDetail
      }
)

export type IndividualOrGroup = 'individual' | 'group'

export type GetStudentGradeResponse = {
    activity_id: string
    score: number
}

export type GetGradeResponse = {
    student: UserEssentialDetail & {
        grades: GetStudentGradeResponse[]
        overall_score: number
    }
}
