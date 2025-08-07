import { ImportGroupFileUploadSchema } from '@/schema'
import {
    CSV_MIME_TYPE,
    EXCEL_MIME_TYPE,
    EXCEL_XLSX_MIME_TYPE,
} from '@/types/general'

import { CSVReader } from './csv-reader'
import { ExcelReader } from './excel-reader'

/**
 * to be used on the client.
 */
export class TextFileReader {
    private file: File
    private reader: ITextFileReader
    private maxRows: number
    private numOfCols: number

    constructor(file: File, numOfCols: Number = 0, maxRows: Number = 1000) {
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

        ImportGroupFileUploadSchema.parse({ file })
        this.file = file

        switch (file.type) {
            case CSV_MIME_TYPE:
                this.reader = new CSVReader(
                    this.file,
                    this.numOfCols,
                    this.maxRows
                )
                break
            case EXCEL_MIME_TYPE:
            case EXCEL_XLSX_MIME_TYPE:
                this.reader = new ExcelReader(
                    this.file,
                    this.numOfCols,
                    this.maxRows
                )
                break
            default:
                throw new Error('File type not supported')
        }

        if (!this.reader) {
            throw new Error('File type not supported')
        }
    }

    async init() {
        console.log('initing')
        await this.reader.init()
    }

    getData() {
        return this.reader.getData()
    }
}

export interface ITextFileReader {
    file: File
    numOfCols: number
    init(): Promise<void>
    getData(): string[][]
}
