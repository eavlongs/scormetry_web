import { cn } from '@/lib/utils'
import { CircleAlert } from 'lucide-react'
import { Label } from './label'

export function LabelWrapper({
    label,
    options = {
        required: true,
        // error_placement: 'bottom',
        label_placement: 'newline',
    },
    error,
    className,
    children,
}: {
    label: {
        text: string
        field: string
    }
    options?: {
        required?: boolean
        // error_placement?: 'bottom'
        label_placement?: 'newline' | 'inline'
        label_className?: string
    }
    error?: string
    className?: string
    children: React.ReactNode
}) {
    const requiredIconClassname =
        options.label_placement == 'newline'
            ? 'text-destructive ml-1'
            : 'text-destructive ml-1 mr-2'

    const labelClassName = cn(
        'text-sm font-medium gap-x-0',
        options.label_className
    )
    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <Label htmlFor={label.field} className={labelClassName}>
                    {label.text}
                    {options.required && (
                        <span className={requiredIconClassname}>*</span>
                    )}
                </Label>

                {options.label_placement == 'inline' && children}
            </div>

            {options.label_placement == 'newline' && children}

            {error && <ErrorMessage error={error} />}
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
