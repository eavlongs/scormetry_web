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
    console.log('show is', show)
    return show ? (
        <SimpleToolTip text={text}>{children}</SimpleToolTip>
    ) : (
        children
    )
}
