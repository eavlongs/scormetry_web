'use client'

import { GetClassroomResponse } from '@/app/(with_navbar)/classroom/[id]/actions'
import { CreateCategoryDialog } from '@/app/(with_navbar)/classroom/[id]/categories/create-category-dialog'
import { CreateGroupingDialog } from '@/app/(with_navbar)/classroom/[id]/groupings/create-grouping-dialog'
import QuillEditor from '@/components/quill-editor'
import { RubricBuilderDialog } from '@/components/rubric-builder-dialog'
import { Button } from '@/components/ui/button'
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { LabelWrapper } from '@/components/ui/label-wrapper'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { getErrorMessageFromValidationError } from '@/lib/utils'
import { RubricSchema } from '@/schema'
import {
    Category,
    GetActivity,
    GetRubricInClassroomResponse,
    Grouping,
    SCORING_TYPE_RANGE,
    SCORING_TYPE_RUBRIC,
} from '@/types/classroom'
import {
    MAX_REQUEST_BODY_SIZE_MB,
    NEW_ACTIVITY_DATA_KEY_PREFIX,
    SP_AFTER_SAVE_KEY,
    SP_DATA_KEY,
} from '@/types/general'
import { VALIDATION_ERROR_MESSAGE, ValidationError } from '@/types/response'
import { Pencil, Plus, Upload, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4, validate as validateUUID } from 'uuid'
import { z } from 'zod'
import { editActivity } from './actions'

const scoringTypes = [
    { id: SCORING_TYPE_RANGE, name: 'Range Based' },
    { id: SCORING_TYPE_RUBRIC, name: 'Rubric Based' },
]

export default function EditActivityForm({
    classroom,
    activity,
    rubricsInClassroom,
}: {
    classroom: GetClassroomResponse
    activity: GetActivity
    rubricsInClassroom: GetRubricInClassroomResponse[]
}) {
    const [categories, setCategories] = useState<Category[]>(
        classroom.categories
    )
    const searchParams = useSearchParams()
    const [groupings, setGroupings] = useState<Grouping[]>(classroom.groupings)
    const router = useRouter()
    const pathname = usePathname()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    )
    const [description, setDescription] = useState({})

    // Form fields
    const titleRef = useRef<HTMLInputElement>(null)
    const [categoryId, setCategoryId] = useState<string>('')
    const [groupingId, setGroupingId] = useState<string>('individual')
    const [rubric, setRubric] = useState<z.infer<typeof RubricSchema> | null>(
        activity.rubric
    )
    const [isRubricDialogOpen, setIsRubricDialogOpen] = useState(false)
    const [selectedRubricId, setSelectedRubricId] = useState<string>('')
    const [scoringType, setScoringType] = useState<string>('none')
    const maxScoreRef = useRef<HTMLInputElement>(null)

    const originalFiles = activity.files

    // // State for managing rubric options
    // const [availableRubrics, setAvailableRubrics] = useState(mockRubrics)

    const [files, setFiles] = useState<
        { id: string; file: File; forcedSize?: number }[]
    >([])

    const [isCreateCategoryDialogOpen, setCreateCategoryDialogOpen] =
        useState(false)

    const [isCreateGroupingDialogOpen, setCreateGroupingDialogOpen] =
        useState(false)

    const [quill, setQuill] = useState()

    function saveDataToSessionStorage(data: any): string {
        const sessionStorageKeys = Object.keys(sessionStorage)

        for (const key of sessionStorageKeys) {
            if (key.startsWith(NEW_ACTIVITY_DATA_KEY_PREFIX)) {
                sessionStorage.removeItem(key)
            }
        }

        const dataKey =
            NEW_ACTIVITY_DATA_KEY_PREFIX + new Date().getTime().toString()

        sessionStorage.setItem(dataKey.toString(), JSON.stringify(data))
        return dataKey
    }

    const parseSessionStorageData = useMemo(() => {
        if (searchParams.has(SP_DATA_KEY)) {
            const dataKey = searchParams.get(SP_DATA_KEY)
            if (!dataKey) return
            const data = sessionStorage.getItem(dataKey)

            if (data) {
                const parsedData = JSON.parse(data)
                return parsedData
            }
        }

        return null
    }, [searchParams])

    useEffect(() => {
        if (parseSessionStorageData) {
            titleRef.current!.value = parseSessionStorageData.title

            if (quill) {
                // i think quilljs has a bug that renders that it doesn't properly cleanup the component during useEffect strict mode, so we need to check whether it is blank first, to insert initial content
                // @ts-expect-error quill is not typed, so it will show error when referencing .setContents
                quill.setContents(
                    JSON.parse(parseSessionStorageData.description)
                )
                setDescription(JSON.parse(parseSessionStorageData.description))
            }

            setCategoryId(parseSessionStorageData.category_id)
            setGroupingId(parseSessionStorageData.grouping_id)
            setScoringType(parseSessionStorageData.scoring_type)
            if (parseSessionStorageData.max_score) {
                maxScoreRef.current!.value = parseSessionStorageData.max_score
            }
            if (parseSessionStorageData.rubric) {
                const tmp = JSON.parse(parseSessionStorageData.rubric)
                setRubric(JSON.parse(parseSessionStorageData.rubric))

                if (tmp.id) {
                    setSelectedRubricId(tmp.id)
                }
            }
        } else {
            if (quill) {
                // i think quilljs has a bug that renders that it doesn't properly cleanup the component during useEffect strict mode, so we need to check whether it is blank first, to insert initial content
                // @ts-expect-error quill is not typed, so it will show error when referencing .setContents
                quill.setContents(JSON.parse(activity.description))
                setDescription(JSON.parse(activity.description))
            }

            setCategoryId(activity.category_id || '')
            setGroupingId(activity.grouping_id || 'individual')
            setScoringType(activity.scoring_type || 'none')

            if (activity.rubric_id) {
                // setRubric(activity.rubric)

                setSelectedRubricId(activity.rubric_id)
            }
        }

        setFiles(() => {
            const files: {
                id: string
                file: File
                forcedSize?: number
            }[] = []

            for (const _file of activity.files) {
                const tmp = new File([], _file.file_name, {
                    type: _file.id,
                })
                files.push({
                    id: _file.id,
                    file: tmp,
                    forcedSize: _file.file_size,
                })
            }

            return files
        })
    }, [
        parseSessionStorageData,
        quill,
        activity.category_id,
        activity.description,
        activity.grouping_id,
        activity.rubric_id,
        // activity.rubric,
        activity.scoring_type,
    ])

    function onUpload(
        files: File[],
        {
            onSuccess,
        }: {
            onSuccess: (file: File) => void
        }
    ) {
        files.map((file) => {
            onSuccess(file)
        })
    }

    const onFileReject = useCallback((file: File, message: string) => {
        toast.error(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
        })
    }, [])

    // Handle new rubric creation
    const handleRubricSave = (rubric: any) => {
        setRubric(rubric)
        setIsRubricDialogOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsSubmitting(true)
        setValidationErrors([])

        const formData = new FormData()
        formData.append('classroom_id', classroom.classroom.id)
        formData.append('title', titleRef.current?.value || '')
        formData.append(
            'description',
            description ? JSON.stringify(description) : '{}'
        )
        formData.append('category_id', categoryId)
        formData.append(
            'grouping_id',
            groupingId !== 'individual' ? groupingId : ''
        )
        formData.append(
            'scoring_type',
            scoringType !== 'none' ? scoringType : ''
        )

        // Handle different scoring types
        if (scoringType === SCORING_TYPE_RANGE && maxScoreRef.current?.value) {
            formData.append('max_score', maxScoreRef.current.value)
        } else if (scoringType === SCORING_TYPE_RUBRIC) {
            formData.append('rubric', JSON.stringify(rubric))
        }

        const filesToRemove = originalFiles
            .map((file) => {
                const idx = files.findIndex((f) => f.id === file.id)

                if (idx === -1) {
                    return file.id
                }
            })
            .filter((v) => v !== undefined)

        filesToRemove.forEach((file) =>
            formData.append('files_to_remove', file)
        )

        files
            .map((file) => file.file)
            .filter((file) => !validateUUID(file.type))
            .forEach((file) => {
                formData.append('files', file)
            })

        const response = await editActivity(activity.id, formData)

        setIsSubmitting(false)
        if (response.success) {
            toast.success(response.message)
            router.push(`/classroom/${classroom.classroom.id}`)
            return
        }

        if (response.message === VALIDATION_ERROR_MESSAGE && response.error) {
            setValidationErrors(response.error)
            return
        }

        toast.error(response.message)
    }

    const renderScoringFields = useCallback(() => {
        switch (scoringType) {
            case SCORING_TYPE_RANGE:
                return (
                    <div>
                        <LabelWrapper
                            label={{
                                text: 'Max Score',
                                field: 'max_score',
                            }}
                            error={getErrorMessageFromValidationError(
                                validationErrors,
                                'max_score'
                            )}
                            options={{
                                label_placement: 'inline',
                            }}
                        >
                            <Input
                                id="max_score"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="Maximum score"
                                ref={maxScoreRef}
                                className="w-auto"
                                defaultValue={activity.max_score?.toPrecision(
                                    2
                                )}
                            />
                        </LabelWrapper>
                    </div>
                )
            case SCORING_TYPE_RUBRIC:
                return (
                    <div className="space-y-4">
                        <LabelWrapper
                            label={{
                                text: 'Rubric',
                                field: 'rubric',
                            }}
                            error={getErrorMessageFromValidationError(
                                validationErrors,
                                'rubric'
                            )}
                        >
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setIsRubricDialogOpen(true)
                                        }
                                        className="flex-1"
                                    >
                                        {rubric ? (
                                            <>
                                                <Pencil
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Edit rubric
                                            </>
                                        ) : (
                                            <>
                                                <Plus
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Create Rubric
                                            </>
                                        )}
                                    </Button>

                                    {/* <Select
                                        value={selectedRubricId}
                                        onValueChange={(val) => {
                                            setSelectedRubricId(val)
                                            setRubric({
                                                ...availableRubrics.findLast(
                                                    (r) => r.id === val
                                                ),
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Import Rubric" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Existing Rubrics
                                                </SelectLabel>
                                                {availableRubrics.map(
                                                    (rubric) => (
                                                        <SelectItem
                                                            key={rubric.id}
                                                            value={rubric.id}
                                                        >
                                                            {rubric.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select> */}
                                </div>
                            </div>
                        </LabelWrapper>
                    </div>
                )
            default:
                return null
        }
    }, [
        scoringType,
        rubric,
        // availableRubrics,
        validationErrors,
        activity.max_score,
        selectedRubricId,
    ])

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="flex flex-col gap-y-4 md:min-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)] md:overflow-y-auto py-6 pr-4">
                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Title',
                                    field: 'title',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'title'
                                )}
                                options={{
                                    label_placement: 'inline',
                                }}
                            >
                                <Input
                                    id="title"
                                    placeholder="Activity title"
                                    ref={titleRef}
                                    defaultValue={activity.title}
                                />
                            </LabelWrapper>
                        </div>

                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Description',
                                    field: 'description',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'description'
                                )}
                                options={{
                                    required: false,
                                }}
                            >
                                <QuillEditor
                                    initialContent={description}
                                    className="min-h-[200px]"
                                    onContentChange={setDescription}
                                    setQuillObject={setQuill}
                                    // readOnly
                                />
                            </LabelWrapper>
                        </div>

                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Attachments',
                                    field: 'files',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'files'
                                )}
                                options={{
                                    required: false,
                                }}
                            >
                                <FileUpload
                                    value={files.map((file) => file.file)}
                                    onValueChange={(val) => {
                                        setFiles((prev) => {
                                            const updatedFiles = val
                                                .map((file) => {
                                                    if (
                                                        validateUUID(file.type)
                                                    ) {
                                                        return prev.find(
                                                            (prevFile) =>
                                                                prevFile.id ===
                                                                file.type
                                                        )
                                                    }
                                                    return {
                                                        id: uuidv4(),
                                                        file: file,
                                                    }
                                                })
                                                .filter((v) => v !== undefined)

                                            return updatedFiles
                                        })
                                    }}
                                    maxFiles={5}
                                    maxSize={
                                        MAX_REQUEST_BODY_SIZE_MB * 1024 * 1024
                                    }
                                    className="w-full"
                                    onUpload={onUpload}
                                    onFileReject={onFileReject}
                                    multiple
                                >
                                    <FileUploadDropzone>
                                        <div className="flex flex-col items-center gap-1">
                                            <Upload className="size-6 text-muted-foreground" />
                                            <p className="font-medium text-sm">
                                                Drag & drop files here
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Or click to browse (max 5 files,
                                                up to {MAX_REQUEST_BODY_SIZE_MB}
                                                MB)
                                            </p>
                                        </div>
                                        <FileUploadTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 w-fit"
                                            >
                                                Browse files
                                            </Button>
                                        </FileUploadTrigger>
                                    </FileUploadDropzone>
                                    <FileUploadList>
                                        {files.map((file) => (
                                            <FileUploadItem
                                                key={file.id}
                                                value={file.file}
                                            >
                                                {/* <div className="flex gap-x-2 items-center w-full"> */}
                                                <FileUploadItemPreview />
                                                <FileUploadItemMetadata
                                                    forcedSize={file.forcedSize}
                                                    className="flex-grow"
                                                />
                                                <FileUploadItemDelete asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                    >
                                                        <X />
                                                    </Button>
                                                </FileUploadItemDelete>
                                                {/* </div> */}

                                                {/* <FileUploadItemProgress /> */}
                                            </FileUploadItem>
                                        ))}
                                    </FileUploadList>
                                </FileUpload>
                            </LabelWrapper>
                        </div>
                    </div>

                    {/* Separator between columns */}
                    <div className="hidden md:block md:absolute left-1/2 top-0 bottom-0 -ml-px">
                        <Separator orientation="vertical" className="h-full" />
                    </div>

                    <div className="flex flex-col gap-y-4 py-6 h-full pl-4">
                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Category',
                                    field: 'category_id',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'category_id'
                                )}
                                options={{
                                    required: false,
                                }}
                            >
                                <Select
                                    value={categoryId}
                                    onValueChange={(val) => {
                                        if (val === 'new') {
                                            setCreateCategoryDialogOpen(true)
                                            return
                                        }
                                        if (val === 'none') {
                                            setCategoryId('')
                                            return
                                        }
                                        setCategoryId(val)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No category (default)
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new">
                                            <div className="flex items-center gap-2">
                                                <Plus size={16} /> New category
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </LabelWrapper>
                        </div>

                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Assignment',
                                    field: 'grouping_id',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'grouping_id'
                                )}
                            >
                                <Select
                                    value={groupingId}
                                    onValueChange={(val) => {
                                        if (val === 'new') {
                                            setCreateGroupingDialogOpen(true)
                                            return
                                        }
                                        setGroupingId(val)
                                        if (rubric && val === 'individual') {
                                            let tmp = structuredClone(rubric)
                                            let shouldInformChange = false
                                            for (const section of tmp.rubric_sections) {
                                                if (
                                                    !shouldInformChange &&
                                                    section.is_group_score
                                                ) {
                                                    shouldInformChange = true
                                                }
                                                section.is_group_score = false
                                            }
                                            if (shouldInformChange) {
                                                toast.info(
                                                    'The rubric sections have been changed to individual scores'
                                                )
                                            }
                                            setRubric(tmp)
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grouping (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="individual"
                                            defaultValue="individual"
                                        >
                                            Individual
                                        </SelectItem>
                                        {groupings.map((grouping) => (
                                            <SelectItem
                                                key={grouping.id}
                                                value={grouping.id}
                                            >
                                                {grouping.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new">
                                            <div className="flex items-center gap-2">
                                                <Plus size={16} /> New Grouping
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </LabelWrapper>
                        </div>

                        <div>
                            <LabelWrapper
                                label={{
                                    text: 'Scoring Type',
                                    field: 'scoring_type',
                                }}
                                error={getErrorMessageFromValidationError(
                                    validationErrors,
                                    'scoring_type'
                                )}
                                options={{
                                    required: true,
                                }}
                            >
                                <Select
                                    value={scoringType}
                                    onValueChange={(value) => {
                                        setScoringType(value)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scoring type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No scoring
                                        </SelectItem>
                                        {scoringTypes.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </LabelWrapper>
                        </div>

                        {renderScoringFields()}

                        <div className="flex justify-end mt-auto gap-4 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            <CreateCategoryDialog
                classroom={classroom}
                open={isCreateCategoryDialogOpen}
                setOpen={setCreateCategoryDialogOpen}
                onCreate={(category: Category) => {
                    setCreateCategoryDialogOpen(false)
                    setCategories((prevCategories) => {
                        // Update categories first
                        const updatedCategories = [...prevCategories, category]
                        // Then set the category ID in the next tick
                        // This still uses React's scheduling but is more intentional
                        Promise.resolve().then(() => setCategoryId(category.id))
                        return updatedCategories
                    })
                }}
            />

            <RubricBuilderDialog
                open={isRubricDialogOpen}
                rubricsInClassroom={rubricsInClassroom}
                isIndividual={groupingId === 'individual'}
                initialData={rubric}
                onOpenChange={setIsRubricDialogOpen}
                onSave={handleRubricSave}
            />

            <CreateGroupingDialog
                classroom={classroom}
                open={isCreateGroupingDialogOpen}
                setOpen={setCreateGroupingDialogOpen}
                onCreate={(grouping: Grouping) => {
                    setCreateGroupingDialogOpen(false)
                    setGroupings((prevGroupings) => {
                        // Update groupings first
                        const updatedGroupings = [...prevGroupings, grouping]
                        // Then set the grouping ID in the next tick
                        // This still uses React's scheduling but is more intentional
                        Promise.resolve().then(() => {
                            setGroupingId(groupingId)

                            const dataKey = saveDataToSessionStorage({
                                title: titleRef.current?.value || '',
                                description: JSON.stringify(description),
                                category_id: categoryId,
                                grouping_id: grouping.id,
                                scoring_type: scoringType,
                                max_score: maxScoreRef.current?.value,
                                rubric: JSON.stringify(rubric),
                            })
                            const urlSearchParams = new URLSearchParams()
                            urlSearchParams.set(
                                SP_AFTER_SAVE_KEY,
                                pathname + '?' + SP_DATA_KEY + '=' + dataKey
                            )
                            router.push(
                                `/grouping/${grouping.id}?${urlSearchParams.toString()}`
                            )
                            return grouping.id
                        })
                        return updatedGroupings
                    })
                }}
            />
        </>
    )
}
