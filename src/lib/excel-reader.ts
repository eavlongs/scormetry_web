import { EXCEL_MIME_TYPE, EXCEL_XLSX_MIME_TYPE } from '@/types/general'
import { read, utils } from 'xlsx'

import { ITextFileReader } from './text-file-reader'

export class ExcelReader implements ITextFileReader {
    file: File
    numOfCols: number
    maxRows: number
    private results: string[][] | null

    constructor(file: File, numOfCols: Number = 0, maxRows: Number = 1000) {
        this.file = file
        this.results = null

        if (maxRows.valueOf() < 1)
            throw new Error('maxRows must be greater than 0')
        if (!Number.isInteger(maxRows)) {
            this.maxRows = Number.parseInt(maxRows.toString())
        } else {
            this.maxRows = maxRows.valueOf()
        }

        if (!Number.isInteger(numOfCols)) {
            this.numOfCols = Number.parseInt(numOfCols.toString())
        } else {
            this.numOfCols = numOfCols.valueOf()
        }

        if (
            this.file.type !== EXCEL_XLSX_MIME_TYPE &&
            this.file.type !== EXCEL_MIME_TYPE
        ) {
            throw new Error('ExcelReader only supports XLSX and XLS files')
        }
    }

    async init() {
        const wb = read(await this.file.arrayBuffer())
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = utils.sheet_to_json(ws, {
            header: 1,
        })
        this.results = data as string[][]
    }

    getData() {
        return this.results || []
    }
}
