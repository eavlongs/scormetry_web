import { z } from 'zod'
import { ALL_CLASSROOM_ROLES, CLASSROOM_COLORS } from './types/classroom'

export const ClassroomSchema = z.object({
    name: z.string().min(2).max(150),
    color: z.enum(CLASSROOM_COLORS).pipe(z.string().min(2).max(50)),
})

export const InviteUserToClassroomSchema = z.object({
    email: z.string().email(),
    role: z.enum(ALL_CLASSROOM_ROLES),
})

export const InviteUsersToClassroomSchema = z.object({
    users: z.array(InviteUserToClassroomSchema).min(1),
})

export const customErrorMap: z.ZodErrorMap = (
    issue: z.ZodIssueOptionalMessage,
    ctx: z.ErrorMapCtx
) => {
    let message: string

    console.log(issue)
    switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
            if (issue.received === 'undefined' || issue.received === 'null') {
                message = 'This field is required'
            } else {
                message = `Expected ${issue.expected}, received ${issue.received}`
            }
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
                message = `Must be at least ${issue.minimum}`
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
