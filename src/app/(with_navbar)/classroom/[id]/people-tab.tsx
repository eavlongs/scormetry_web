import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MailPlus, Search, UserPlus } from 'lucide-react'

export default function PeopleTab({ classroom }) {
    const teachers = classroom.teachers || []
    const students = classroom.students || []

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>People</CardTitle>
                        <CardDescription>
                            Manage teachers and students
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <MailPlus className="mr-2 h-4 w-4" />
                            Invite by Email
                        </Button>
                        <Button variant="outline">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add People
                        </Button>
                    </div>
                </div>

                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search people..." className="pl-8" />
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <section>
                    <h3 className="text-lg font-semibold mb-2">
                        Teachers ({teachers.length})
                    </h3>
                    <div className="space-y-2">
                        {teachers.length > 0 ? (
                            teachers.map((teacher) => (
                                <PersonRow
                                    key={teacher.id}
                                    person={teacher}
                                    role="Teacher"
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-2">
                                No teachers assigned
                            </p>
                        )}
                    </div>
                </section>

                <Separator />

                <section>
                    <h3 className="text-lg font-semibold mb-2">
                        Students ({students.length})
                    </h3>
                    <div className="space-y-2">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <PersonRow
                                    key={student.id}
                                    person={student}
                                    role="Student"
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm py-2">
                                No students enrolled
                            </p>
                        )}
                    </div>
                </section>
            </CardContent>
        </Card>
    )
}

function PersonRow({ person, role }) {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>
                        {person.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {person.email}
                    </p>
                </div>
            </div>

            <div className="text-sm text-muted-foreground">{role}</div>
        </div>
    )
}
