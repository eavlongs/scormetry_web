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
        error_display: 'text',
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
        error_display?: 'text' | 'tooltip'
    }
    error?: string
    className?: string
    children: React.ReactNode
}) {
    const defaultOptions = {
        required: true,
        label_placement: 'newline',
        error_display: 'text',
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
            {optionsWithDefaults.error_display === 'text' && (
                <>
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

                    {error && <ErrorMessage error={error} />}
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
        <div className="text-[13px] text-destructive mt-1 flex items-center gap-x-0.5">
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
