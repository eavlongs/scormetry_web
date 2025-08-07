import { CSV_MIME_TYPE } from '@/types/general'
import Papa from 'papaparse'

import { ITextFileReader } from './text-file-reader'

export class CSVReader implements ITextFileReader {
    file: File
    numOfCols: number
    maxRows: number
    private results: Papa.ParseResult<unknown> | null

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

        if (this.file.type !== CSV_MIME_TYPE) {
            throw new Error('CSVReader only supports CSV files')
        }
    }

    async init() {
        await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
            let numberOfRows = 0

            Papa.parse(this.file, {
                header: false,
                skipEmptyLines: true,
                encoding: 'UTF-8',
                complete: (results, _) => {
                    for (const row of results.data) {
                        if (numberOfRows >= this.maxRows) {
                            break
                        }
                        numberOfRows++

                        if (
                            this.numOfCols > 0 &&
                            (!Array.isArray(row) ||
                                row.length !== this.numOfCols)
                        ) {
                            reject(
                                new Error(
                                    'Invalid CSV structure. Please provide a CSV file with 2 columns, group name and student email'
                                )
                            )
                        }
                    }
                    resolve(results)
                },
                error: (error: Error, _) => {
                    reject(error)
                },
            })
        }).then((results: Papa.ParseResult<unknown>) => {
            console.log('here')
            console.log('resolve result', results)
            this.results = results
        })
    }

    getData() {
        return this.results ? (this.results.data as string[][]) : []
    }
}
