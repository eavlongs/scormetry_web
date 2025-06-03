import { cn } from '@/lib/utils'
import { CircleAlert } from 'lucide-react'
import { Label } from './label'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './tooltip'

export function LabelWrapper({
    label,
    options = {
        required: true,
        // error_placement: 'bottom',
        label_placement: 'newline',
        error_display: 'under-label',
    },
    error,
    className,
    children,
}: {
    label: {
        text: string
        field: string
    } | null
    options?: {
        required?: boolean
        // error_placement?: 'bottom'
        label_placement?: 'newline' | 'inline' | 'inline-end'
        label_className?: string
        error_display?: 'under-label' | 'over-label' | 'tooltip'
    }
    error?: string
    className?: string
    children: React.ReactNode
}) {
    const defaultOptions: {
        required: NonNullable<typeof options.required>
        label_placement: NonNullable<typeof options.label_placement>
        error_display: NonNullable<typeof options.error_display>
    } = {
        required: true,
        label_placement: 'newline',
        error_display: 'under-label',
    }

    const optionsWithDefaults = { ...defaultOptions, ...options }

    const requiredIconClassname =
        optionsWithDefaults.label_placement == 'newline'
            ? 'text-destructive ml-1'
            : 'text-destructive ml-1 mr-2'

    const labelClassName = cn(
        'text-sm font-medium gap-x-0',
        optionsWithDefaults.label_className
    )
    return (
        <div className={cn('space-y-2', className)}>
            {['under-label', 'over-label'].includes(
                optionsWithDefaults.error_display
            ) && (
                <>
                    {error &&
                        optionsWithDefaults.error_display == 'over-label' && (
                            <ErrorMessage error={error} />
                        )}
                    {label && (
                        <div className="flex items-center">
                            {optionsWithDefaults.label_placement ==
                                'inline-end' && children}

                            <Label
                                htmlFor={label.field}
                                className={labelClassName}
                            >
                                {label.text}
                                {optionsWithDefaults.required && (
                                    <span className={requiredIconClassname}>
                                        *
                                    </span>
                                )}
                            </Label>

                            {optionsWithDefaults.label_placement == 'inline' &&
                                children}
                        </div>
                    )}

                    {optionsWithDefaults.label_placement == 'newline' &&
                        children}

                    {error &&
                        optionsWithDefaults.error_display == 'under-label' && (
                            <ErrorMessage error={error} />
                        )}
                </>
            )}

            {optionsWithDefaults.error_display === 'tooltip' && (
                <>
                    {label && (
                        <Label htmlFor={label.field} className={labelClassName}>
                            {label.text}
                            {optionsWithDefaults.required && (
                                <span className={requiredIconClassname}>*</span>
                            )}
                        </Label>
                    )}

                    <TooltipProvider>
                        <Tooltip defaultOpen={true}>
                            {/* {children} */}
                            <TooltipTrigger asChild>
                                {error ? (
                                    <div className="border border-red-500 rounded-sm">
                                        {children}
                                    </div>
                                ) : (
                                    children
                                )}
                            </TooltipTrigger>
                            {error && (
                                <TooltipContent>
                                    <p>{error}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </>
            )}
        </div>
    )
}

function ErrorMessage({ error }: { error: string }) {
    return (
        <div className="text-[13px] text-destructive mt-1 flex items-start gap-x-0.5">
            <CircleAlert
                color="red"
                size={16}
                fill="red"
                stroke="white"
                strokeWidth={3}
            />{' '}
            {error}
        </div>
    )
}
