import { EXCEL_XLSX_MIME_TYPE } from '@/types/general'
import { utils, write as xlsxWrite } from 'xlsx'
import { ITextFileWriter } from './text-file-writer'

export class ExcelWriter implements ITextFileWriter {
    data: any
    fileNameWithoutExtension: string
    blob!: Blob

    constructor(data: any, fileNameWithoutExtension: string) {
        this.data = data
        this.fileNameWithoutExtension = fileNameWithoutExtension
    }

    async write() {
        const worksheet = utils.json_to_sheet(this.data)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, 'Grades')
        const excelData = xlsxWrite(workbook, {
            bookType: 'xlsx',
            type: 'array',
        })
        const blob = new Blob([excelData], {
            type: EXCEL_XLSX_MIME_TYPE,
        })

        this.blob = blob
    }

    async download() {
        const link = document.createElement('a')
        const url = URL.createObjectURL(this.blob)
        link.href = url
        link.download = this.fileNameWithoutExtension + '.xlsx'
        link.click()
        URL.revokeObjectURL(url)
    }
}
