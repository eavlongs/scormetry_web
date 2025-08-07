import { CSVWriter } from './csv-writer'
import { ExcelWriter } from './excel-writer'

/**
 * to be used on the client.
 */
export class TextFileWriter {
    private data: any
    private fileType: 'csv' | 'xlsx'
    private fileNameWithoutExtension: string
    private writer?: ITextFileWriter

    constructor(
        data: any,
        fileType: 'csv' | 'xlsx',
        fileNameWithoutExtension: string
    ) {
        this.data = data
        this.fileType = fileType
        this.fileNameWithoutExtension = fileNameWithoutExtension
    }

    async write() {
        switch (this.fileType) {
            case 'csv':
                const csvFileWriter = new CSVWriter(
                    this.data,
                    this.fileNameWithoutExtension
                )
                csvFileWriter.write()
                this.writer = csvFileWriter
                break
            case 'xlsx':
                const excelFileWriter = new ExcelWriter(
                    this.data,
                    this.fileNameWithoutExtension
                )
                excelFileWriter.write()
                this.writer = excelFileWriter
                break
            default:
                throw new Error('file type not supported')
        }
    }

    async download() {
        if (!this.writer) throw new Error('writer not initialized')
        this.writer?.download()
    }
}

export interface ITextFileWriter {
    data: any
    fileNameWithoutExtension: string
    blob: Blob

    write(): Promise<void>
    download(): Promise<void>
}
