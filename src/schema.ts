import assert from 'assert'
import { z } from 'zod'
import {
    ALL_CLASSROOM_ROLES,
    CLASSROOM_COLORS,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
    SCORING_TYPES,
} from './types/classroom'
import {
    ACCEPTED_IMPORT_FILE_TYPES,
    MAX_IMPORT_FILE_SIZE_MB,
    MAX_REQUEST_BODY_SIZE_MB,
} from './types/general'

export const ClassroomSchema = z.object({
    name: z.string().min(2).max(150),
    color: z.enum(CLASSROOM_COLORS).pipe(z.string().min(2).max(50)),
})

export const InviteUserToClassroomSchema = z.object({
    email: z.string().email(),
    role: z.enum(ALL_CLASSROOM_ROLES),
})

export const InviteUsersToClassroomSchema = z.object({
    users: z
        .array(InviteUserToClassroomSchema)
        .min(1, 'Please input at least 1 email'),
})

export const CategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    score_percentage: z.coerce
        .number()
        .gt(0, 'This value must be greater than 0')
        .lte(100, 'This value cannot exceed 100%'),
})

export const GroupingSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    description: z.string().max(1000, 'Description is too long').nullable(),
})

export const GroupNameSchema = z
    .string()
    .min(1, 'Group name is required')
    .max(50, 'Group name cannot exceed 50 characters')
    .refine((val) => val.trim().length > 0, 'Name cannot be empty')
    .refine(
        (val) => val.trim().length <= 50,
        'Group name cannot exceed 50 characters'
    )

export const GroupingCompositionSchema = z.object({
    groups: z
        .array(
            z.object({
                id: z.string().min(1, 'Group ID is required'),
                name: z
                    .string()
                    .min(1, 'Group name is required')
                    .max(50, 'Group name cannot exceed 50 characters'),
                students: z
                    .array(z.string().min(1, 'Student ID is required'))
                    .min(1, 'Each group must have at least one student'),
            })
        )
        .min(1, 'there must be at least 1 group'),
})

export const RubricCriteriaScoreRangeSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Score range name is required')
            .max(50, 'Score range name cannot exceed 50 characters'),
        description: z.string().max(255),
        min_score: z.coerce.number().int().nonnegative(),
        max_score: z.coerce.number().int().nonnegative(),
    })
    .superRefine((val, ctx) => {
        if (val.min_score >= val.max_score) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                message:
                    'Min score cannot be greater than or equal to max score',
                path: ['min_score'],
                maximum: val.max_score,
                inclusive: false,
                type: 'number',
            })
            return
        }
    })

export const RubricCriteriaSchema = z.object({
    name: z
        .string()
        .min(1, 'Criteria name is required')
        .max(50, 'Criteria name cannot exceed 50 characters'),
    // description: z.string().max(255).optional(),
    criteria_score_ranges: z
        .array(RubricCriteriaScoreRangeSchema)
        .min(1, 'At least 1 score range is required')
        .superRefine((val, ctx) => {
            assert(val.length > 0)
            let last = val[0].max_score

            for (let i = 1; i < val.length; i++) {
                const scoreRange = val[i]

                if (scoreRange.min_score < last + 1) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `The minimum score of a score range must be greater than the previous max score`,
                        path: ['criteria_score_ranges', i, 'min_score'],
                    })
                    return
                }
            }
        }),
})

export const RubricSectionSchema = z.object({
    name: z.string().min(1, 'Section name is required').max(50),
    description: z.string().max(255),
    is_group_score: z.boolean(),
    score_percentage: z.coerce.number().nonnegative().lte(100),
    rubric_criterias: z
        .array(RubricCriteriaSchema)
        .min(1, 'At least 1 criteria is required'),
})

export const RubricSchema = z.object({
    note: z.string(),
    rubric_sections: z
        .array(RubricSectionSchema)
        .min(1, 'At least 1 section is required')
        .superRefine((val, ctx) => {
            assert(val.length > 0)
            let totalPercentage = 0

            for (const section of val) {
                totalPercentage += section.score_percentage
            }

            if (totalPercentage !== 0 && totalPercentage !== 100) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Total score percentage must be 100%. Current total is ${totalPercentage}%`,
                    path: ['sections'],
                })
                return
            }
        }),
})

export const ActivitySchema = z
    .object({
        title: z.string().min(1, 'Title is required').max(255),
        description: z.string().nullable(),
        files: z.any().superRefine((val, ctx) => {
            if (val === undefined) return

            if (Array.isArray(val)) {
                if (val.length > 5) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.too_big,
                        message: 'Maximum files allowed is 5',
                        path: ['files'],
                        maximum: 5,
                        inclusive: true,
                        type: 'array',
                    })
                    return
                }

                let totalSize = 0

                for (const file of val) {
                    if (!(file instanceof File)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.invalid_type,
                            message: 'Invalid file type',
                            path: ['files'],
                            expected: 'object',
                            received: typeof file,
                        })
                        return
                    }

                    totalSize += file.size
                }

                if (totalSize > MAX_REQUEST_BODY_SIZE_MB * 1024 * 1024) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.too_big,
                        message: `Maximum total file size is ${MAX_REQUEST_BODY_SIZE_MB}MB`,
                        path: ['files'],
                        maximum: MAX_REQUEST_BODY_SIZE_MB,
                        inclusive: true,
                        type: 'array',
                    })
                    return
                }

                return
            }

            if (!(val instanceof File)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.invalid_type,
                    message: 'Invalid type',
                    path: ['files'],
                    expected: 'object',
                    received: typeof val,
                })
                return
            }
        }),
        category_id: z.string().nullable(),
        grouping_id: z.string().nullable(), // nullable for individual tasks
        scoring_type: z.enum([...SCORING_TYPES, '']).nullable(),
        max_score: z.any(),
        // rubric_id: z.string().nullable(),
        rubric: z.any().nullable(),
    })
    .superRefine((val, ctx) => {
        if (val.scoring_type !== SCORING_TYPE_RANGE) return
        if (!val.max_score) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Max score is required when scoring type is 'range-based'",
                path: ['max_score'],
            })
            return
        }

        const maxScoreNumber = Number(val.max_score)
        if (Number.isNaN(maxScoreNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max score must be a number',
                path: ['max_score'],
            })
            return
        }

        if (maxScoreNumber <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max score must be greater than 0',
                path: ['max_score'],
            })
            return
        }
    })
    .superRefine((val, ctx) => {
        if (val.scoring_type === SCORING_TYPE_RUBRIC) {
            const result = RubricSchema.safeParse(JSON.parse(val.rubric))

            if (result.success) {
                return true
            }

            for (const issue of result.error.issues) {
                ctx.addIssue(issue)
            }

            return false
        }
        return true
    })

export const EditActivitySchema = z
    .object({
        title: z.string().min(1, 'Title is required').max(255),
        description: z.string().nullable(),
        files: z.any().superRefine((val, ctx) => {
            if (val === undefined) return

            if (Array.isArray(val)) {
                if (val.length > 5) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.too_big,
                        message: 'Maximum files allowed is 5',
                        path: ['files'],
                        maximum: 5,
                        inclusive: true,
                        type: 'array',
                    })
                    return
                }

                let totalSize = 0

                for (const file of val) {
                    if (!(file instanceof File)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.invalid_type,
                            message: 'Invalid file type',
                            path: ['files'],
                            expected: 'object',
                            received: typeof file,
                        })
                        return
                    }

                    totalSize += file.size
                }

                if (totalSize > MAX_REQUEST_BODY_SIZE_MB * 1024 * 1024) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.too_big,
                        message: `Maximum total file size is ${MAX_REQUEST_BODY_SIZE_MB}MB`,
                        path: ['files'],
                        maximum: MAX_REQUEST_BODY_SIZE_MB,
                        inclusive: true,
                        type: 'array',
                    })
                    return
                }

                return
            }

            if (!(val instanceof File)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.invalid_type,
                    message: 'Invalid type',
                    path: ['files'],
                    expected: 'object',
                    received: typeof val,
                })
                return
            }
        }),
        category_id: z.string().nullable(),
        grouping_id: z.string().nullable(), // nullable for individual tasks
        scoring_type: z.enum([...SCORING_TYPES, '']).nullable(),
        max_score: z.any(),
        files_to_remove: z.array(z.string()).optional(),
        // rubric_id: z.string().nullable(),
        rubric: z.any().nullable(), // to be defined, RubricSchema,
    })
    .superRefine((val, ctx) => {
        if (val.scoring_type !== SCORING_TYPE_RANGE) return
        if (!val.max_score) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Max score is required when scoring type is 'range-based'",
                path: ['max_score'],
            })
            return
        }

        const maxScoreNumber = Number(val.max_score)
        if (Number.isNaN(maxScoreNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max score must be a number',
                path: ['max_score'],
            })
            return
        }

        if (maxScoreNumber <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max score must be greater than 0',
                path: ['max_score'],
            })
            return
        }
    })
    .refine(
        (val) => {
            if (val.scoring_type === SCORING_TYPE_RUBRIC) {
                return !!JSON.parse(val.rubric)
            }
            return true
        },
        {
            message: "Rubric is required when scoring type is 'rubric-based'",
            path: ['rubric'],
        }
    )
    .refine(
        (val) => {
            if (!val.files_to_remove || val.files_to_remove.length === 0)
                return true

            // if files is array (multiple files), check if the sum of files exceed 5
            if (Array.isArray(val.files)) {
                if (val.files.length + val.files_to_remove.length > 5) {
                    return false
                }
            }

            if (val.files instanceof File) {
                if (val.files_to_remove.length > 4) return false
            }

            return true
        },
        {
            path: ['files'],
            message: 'Maximum files allowed is 5',
        }
    )

export const ImportGroupFileUploadSchema = z.object({
    file: z.instanceof(File).superRefine((f, ctx) => {
        if (f.size >= MAX_IMPORT_FILE_SIZE_MB * 1024 * 1024) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                message: `Maximum file size is ${MAX_IMPORT_FILE_SIZE_MB}MB, received ${(f.size / (1024 * 1024)).toFixed(2)}MB`,
                path: ['file'],
                maximum: MAX_IMPORT_FILE_SIZE_MB,
                inclusive: true,
                type: 'number',
            })
            return
        }

        if (!ACCEPTED_IMPORT_FILE_TYPES.includes(f.type)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Invalid file type. Supported file types are: ${ACCEPTED_IMPORT_FILE_TYPES.join(
                    ', '
                )}`,
                path: ['file'],
            })
        }
    }),
})

export const RubricScoreSchema = z.object({
    assignee_id: z.string(),
    type: z.enum(['individual', 'group']),
    scores: z
        .array(
            z.object({
                rubric_criteria_id: z.string(),
                score: z.coerce.number().nonnegative(),
            })
        )
        .min(1, 'At least 1 score is required'),
})

export const customErrorMap: z.ZodErrorMap = (
    issue: z.ZodIssueOptionalMessage,
    ctx: z.ErrorMapCtx
) => {
    let message: string

    console.log(issue)
    switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
            if (issue.expected === 'number' && issue.received === 'nan') {
                message = 'This field must be a number'
                break
            }
            if (issue.received === 'undefined' || issue.received === 'null') {
                message = 'This field is required'
            } else {
                message = `Expected ${issue.expected}, received ${issue.received}`
            }
            break

        case z.ZodIssueCode.invalid_enum_value:
            message =
                'Please select one of the following options: ' +
                issue.options.join(', ')
            break

        case z.ZodIssueCode.invalid_string:
            if (issue.validation === 'email') {
                message = 'Please enter a valid email address'
            } else if (issue.validation === 'url') {
                message = 'Please enter a valid URL'
            } else if (issue.validation === 'regex') {
                message = 'Invalid format'
            } else {
                message = 'Invalid input'
            }
            break

        case z.ZodIssueCode.too_small:
            if (issue.type === 'string') {
                message = `Must be at least ${issue.minimum} character${issue.minimum === 1 ? '' : 's'}`
            } else if (issue.type === 'number') {
                if (issue.inclusive) {
                    message = `Must be at least ${issue.minimum}`
                } else {
                    message = `Must be greater than ${issue.minimum}`
                }
            } else if (issue.type === 'array') {
                message = `Please select at least ${issue.minimum} item${issue.minimum === 1 ? '' : 's'}`
            } else {
                message = 'Value is too small'
            }
            break

        case z.ZodIssueCode.too_big:
            if (issue.type === 'string') {
                message = `Cannot exceed ${issue.maximum} character${issue.maximum === 1 ? '' : 's'}`
            } else if (issue.type === 'number') {
                message = `Cannot exceed ${issue.maximum}`
            } else if (issue.type === 'array') {
                message = `Cannot select more than ${issue.maximum} item${issue.maximum === 1 ? '' : 's'}`
            } else {
                message = 'Value is too large'
            }
            break

        case z.ZodIssueCode.invalid_enum_value:
            message = `Must be one of: ${issue.options
                .map((option) =>
                    typeof option === 'string' ? `'${option}'` : String(option)
                )
                .join(', ')}`
            break

        case z.ZodIssueCode.invalid_date:
            message = 'Please enter a valid date'
            break

        case z.ZodIssueCode.not_multiple_of:
            message = `Must be a multiple of ${issue.multipleOf}`
            break

        case z.ZodIssueCode.custom:
            message = issue.message || 'Invalid input'
            break

        default:
            message = ctx.defaultError
            break
    }

    return { message }
}

z.setErrorMap(customErrorMap)
