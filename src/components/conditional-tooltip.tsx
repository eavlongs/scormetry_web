import { SimpleToolTip } from './simple-tooltip'

export default function ConditionalTooltip({
    text,
    show,
    children,
}: {
    text: string
    show: boolean
    children: React.ReactNode
}) {
    return show ? (
        <SimpleToolTip text={text}>{children}</SimpleToolTip>
    ) : (
        children
    )
}
