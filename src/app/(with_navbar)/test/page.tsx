'use client'
import { RubricBuilderDialog } from '@/components/rubric-builder-dialog'

export default function Test() {
    return (
        <RubricBuilderDialog
            open={true}
            onOpenChange={(test) => {}}
            onSave={() => {}}
        />
    )
}
