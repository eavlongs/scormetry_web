import Papa from 'papaparse'

import { ITextFileWriter } from './text-file-writer'

export class CSVWriter implements ITextFileWriter {
    data: any
    fileNameWithoutExtension: string
    blob!: Blob

    constructor(data: any, fileNameWithoutExtension: string) {
        this.data = data
        this.fileNameWithoutExtension = fileNameWithoutExtension
    }

    async write() {
        const csvString = Papa.unparse(this.data)
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })

        this.blob = blob
    }

    async download() {
        const link = document.createElement('a')
        const url = URL.createObjectURL(this.blob)
        link.href = url
        link.download = this.fileNameWithoutExtension + '.csv'
        link.click()
        URL.revokeObjectURL(url)
    }
}
