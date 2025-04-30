import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import React, { useEffect, useState } from 'react'

export function EditRubricDialog({
    rubric,
    setRubric,
    onSave,
}: {
    rubric: any
    setRubric: React.Dispatch<React.SetStateAction<any>>
    onSave: (rubric: any) => void
}) {
    const [rubricName, setRubricName] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        setIsSaving(true)
        const newRubricId = `rubric-${Date.now()}`
        onSave({ id: newRubricId, name: rubricName })
        setIsSaving(false)
    }

    useEffect(() => {
        if (rubric) {
            setRubricName(rubric.name)
        }
    }, [rubric])

    return (
        <Dialog
            open={!!rubric}
            onOpenChange={(open) => !open && setRubric(null)}
        >
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Rubric</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <LabelWrapper
                        label={{
                            text: 'Rubric Name',
                            field: 'rubric_name',
                        }}
                    >
                        <Input
                            id="rubric_name"
                            placeholder="Enter rubric name"
                            value={rubricName}
                            onChange={(e) => setRubricName(e.target.value)}
                        />
                    </LabelWrapper>

                    {/* Here you would add more fields for configuring rubric criteria */}
                    <div className="border p-4 rounded-md bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                            Rubric configuration UI would go here (criteria,
                            levels, etc.)
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setRubric(null)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Updating...' : 'Save Rubric'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
