import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import { useState } from 'react'

export function CreateRubricDialog({
    isOpen,
    onClose,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create New Rubric</DialogTitle>
                    <DialogDescription>
                        Create a new rubric for evaluating student activities
                    </DialogDescription>
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
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Rubric'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
