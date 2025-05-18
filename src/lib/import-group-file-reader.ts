import { GetGroupingDetailResponse } from '@/app/(with_navbar)/grouping/[id]/actions'
import { UserEssentialDetail } from '@/types/auth'
import { TextFileReader } from './text-file-reader'

/**
 * file content structure should be:
 * group_name, student_email (no header)
 */
export class ImportGroupFileReader {
    // returns just the array of string arrays
    public static async readRaw(file: File, maxRows: Number = 1000) {
        const textFileReader = new TextFileReader(file, 2, maxRows)
        await textFileReader.init()
        return textFileReader.getData()
    }

    // filters and format the data
    public static async readWithFilterAndFormat(
        file: File,
        groupingId: string,
        allStudents: UserEssentialDetail[],
        maxRows: Number = 1000
    ): Promise<{
        groups: GetGroupingDetailResponse['groups']
        availableStudents: UserEssentialDetail[]
    }> {
        const textFileReader = new TextFileReader(file, 2, maxRows)
        await textFileReader.init()
        const data = textFileReader.getData()

        const studentEmailmap = new Map<string, UserEssentialDetail>()

        allStudents.forEach((student) => {
            studentEmailmap.set(student.email, student)
        })

        const groupMembersMap = new Map<string, UserEssentialDetail[]>()
        const existingStudentMap = new Map<string, boolean>()

        for (const row of data) {
            const groupName = row[0]
            const studentEmail = row[1]

            if (existingStudentMap.has(studentEmail)) {
                // ignore duplicate students
                continue
            }

            const student = studentEmailmap.get(studentEmail)
            if (!student) {
                console.log('student not found')
                continue
            }

            if (groupMembersMap.has(groupName)) {
                groupMembersMap.get(groupName)?.push(student)
            } else {
                groupMembersMap.set(groupName, [student])
            }

            existingStudentMap.set(studentEmail, true)
        }

        const groups: GetGroupingDetailResponse['groups'] = []

        for (const [groupName, students] of groupMembersMap.entries()) {
            groups.push({
                id: `group-${groupName}-${new Date().getTime()}`,
                grouping_id: groupingId,
                name: groupName,
                users: students,
            })
        }

        const availableStudents = []

        for (const student of allStudents) {
            if (!existingStudentMap.has(student.email)) {
                availableStudents.push(student)
            }
        }

        return { groups, availableStudents }
    }
}
