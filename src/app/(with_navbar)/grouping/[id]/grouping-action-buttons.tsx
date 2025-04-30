'use client'

import { Button } from '@/components/ui/button'
import { Plus, Save } from 'lucide-react'

export default function GroupingActionButtons({
    saving,
    discardingChange,
    onCreateGroup,
    onDiscardChange,
    onSaveChanges,
    hasDataChanged,
}: {
    saving: boolean
    discardingChange: boolean
    onCreateGroup: () => void
    onDiscardChange: () => void
    onSaveChanges: () => void
    hasDataChanged: boolean
}) {
    return (
        <div className="flex gap-2 w-full sm:w-auto">
            <Button
                onClick={onCreateGroup}
                className="flex items-center gap-2 flex-1 sm:flex-none"
            >
                <Plus className="h-4 w-4" />
                Create Group
            </Button>
            <Button
                onClick={onDiscardChange}
                variant="destructive"
                className="flex items-center gap-2 flex-1 sm:flex-none"
                disabled={discardingChange || !hasDataChanged || saving}
            >
                <Save className="h-4 w-4" />
                Discard Change
            </Button>
            <Button
                onClick={onSaveChanges}
                className="flex items-center gap-2 flex-1 sm:flex-none bg-green-600 hover:bg-green-500 hover:text-gray-100"
                disabled={saving || !hasDataChanged || discardingChange}
            >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    )
}
