'use client'

import { Button } from '@/components/ui/button'
import { ImportGroupFileReader } from '@/lib/import-group-file-reader'
import {
    convertZodErrorToValidationError,
    getValidationErrorMessage,
} from '@/lib/utils'
import { ImportGroupFileUploadSchema } from '@/schema'
import { UserEssentialDetail } from '@/types/auth'
import { ActionResponse } from '@/types/response'
import { Download, Plus } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { GetGroupingDetailResponse } from './actions'

export default function GroupingActionButtons({
    groupingDetail,
    onCreateGroup,
    onImport,
}: {
    groupingDetail: GetGroupingDetailResponse
    onCreateGroup: () => void
    onImport: (
        groups: GetGroupingDetailResponse['groups'],
        availableStudents: UserEssentialDetail[]
    ) => void
}) {
    const importGroupsRef = useRef<HTMLInputElement>(null)

    async function handleImportGroups(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            toast.error('Please select a file to import')
            return
        }

        const files = e.target.files

        if (files.length > 1) {
            toast.error('Please select only one file to import')
            return
        }

        const response = await importGroups(
            files[0],
            groupingDetail.grouping.id,
            getAllStudents()
        )

        if (response.success) {
            onImport(response.data!.groups, response.data!.availableStudents)
        } else {
            toast.error(response.message)
        }

        e.target.value = ''
        e.target.files = null
    }

    function getAllStudents(): UserEssentialDetail[] {
        let students: UserEssentialDetail[] = []

        for (const group of groupingDetail.groups) {
            students.push(...group.users)
        }

        students.push(...groupingDetail.available_students)

        return students
    }

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
                className="flex items-center gap-2 flex-1 sm:flex-none"
                onClick={() => importGroupsRef.current?.click()}
            >
                <Download className="h-4 w-4" />
                Import Groups
            </Button>

            {/* <Button className="flex items-center gap-2 flex-1 sm:flex-none">
                <Upload className="h-4 w-4" />
                Export Groups
            </Button> */}

            <input
                id="import-groups"
                type="file"
                className="hidden"
                ref={importGroupsRef}
                accept=".csv,.xlsx,.xls"
                multiple={false}
                onChange={handleImportGroups}
            />
        </div>
    )
}

// this function will only return the data to the frontend, no database connection
async function importGroups(
    file: File,
    groupingId: string,
    allStudents: UserEssentialDetail[]
): Promise<
    ActionResponse<{
        groups: GetGroupingDetailResponse['groups']
        availableStudents: UserEssentialDetail[]
    }>
> {
    try {
        ImportGroupFileUploadSchema.parse({ file })
        const response = await ImportGroupFileReader.readWithFilterAndFormat(
            file,
            groupingId,
            allStudents
        )

        if (response.groups.length === 0) {
            throw new Error(
                'No valid group was formed. Please check the data you provided'
            )
        }

        return {
            success: true,
            message: 'Successfully imported groups',
            data: {
                groups: response.groups,
                availableStudents: response.availableStudents,
            },
        }
    } catch (e: any) {
        if (e instanceof ZodError) {
            return {
                success: false,
                message: getValidationErrorMessage(
                    convertZodErrorToValidationError(e)
                ),
            }
        }
        return {
            success: false,
            message: e.message,
        }
    }
}
