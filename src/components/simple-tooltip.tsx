import { TooltipContentProps } from '@radix-ui/react-tooltip'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'

export function SimpleToolTip({
    children,
    text,
    ...props
}: {
    children: React.ReactNode
    text: string
} & TooltipContentProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild className="cursor-pointer">
                    {children}
                </TooltipTrigger>
                {text && (
                    <TooltipContent {...props}>
                        <p>{text}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    )
}
