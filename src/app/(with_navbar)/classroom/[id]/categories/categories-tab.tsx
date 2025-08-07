'use client'

import { SimpleToolTip } from '@/components/simple-tooltip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Category } from '@/types/classroom'
import { EditIcon, FileTextIcon, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { GetClassroomResponse } from '../actions'
import { CreateCategoryDialog } from './create-category-dialog'
import { DeleteCategoryDialog } from './delete-category-dialog'
import { EditCategoryDialog } from './edit-category-dialog'

export default function CategoriesTab({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Calculate remaining score percentage
    const totalScorePercentage = classroom.categories.reduce(
        (sum, category) => sum + category.score_percentage,
        0
    )
    const remainingScorePercentage = 100 - totalScorePercentage

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Categories</h2>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Category
                </Button>
            </div>
            <Card className="py-4">
                <CardContent>
                    <CategoryList classroom={classroom} />
                </CardContent>

                <CreateCategoryDialog
                    open={isCreateDialogOpen}
                    setOpen={setIsCreateDialogOpen}
                    classroom={classroom}
                />
            </Card>

            <div className="mt-4 ml-4 text-sm">
                <div className="text-muted-foreground">
                    {remainingScorePercentage > 0
                        ? `Remaining Percentage: ${remainingScorePercentage}%`
                        : 'Maximum percentage reached'}
                </div>
            </div>
        </>
    )
}

export function CategoryList({
    classroom,
}: {
    classroom: GetClassroomResponse
}) {
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null
    )

    if (classroom.categories.length === 0) {
        return (
            <div className="text-center p-8">
                <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">
                    No categories yet
                </h3>
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Score Percentage</TableHead>
                        <TableHead className="w-[150px] text-center">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classroom.categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.score_percentage}%</TableCell>
                            <TableCell className="flex justify-center">
                                <div className="flex items-center gap-2">
                                    <SimpleToolTip text="Edit Category">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setCategoryToEdit(category)
                                            }
                                        >
                                            <EditIcon className="h-4 w-4" />
                                            <span className="sr-only">
                                                Edit
                                            </span>
                                        </Button>
                                    </SimpleToolTip>
                                    <SimpleToolTip text="Delete Category">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setCategoryToDelete(category)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">
                                                Delete
                                            </span>
                                        </Button>
                                    </SimpleToolTip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <EditCategoryDialog
                classroom={classroom}
                category={categoryToEdit}
                setCategory={setCategoryToEdit}
            />
            <DeleteCategoryDialog
                classroom={classroom}
                category={categoryToDelete}
                setCategory={setCategoryToDelete}
            />
        </>
    )
}
