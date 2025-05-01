export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export const SP_CREATE_KEY = 'create'
export const SP_AFTER_CREATE_KEY = 'after_create'
export const SP_AFTER_SAVE_KEY = 'after_save'
export const SP_DATA_KEY = 'data'

export const NEW_ACTIVITY_DATA_KEY_PREFIX = 'na_'

export const SP_TRUE_VALUE = '1'
export const SP_FALSE_VALUE = '0'

export const MAX_REQUEST_BODY_SIZE_MB = 30
export const MAX_IMPORT_FILE_SIZE_MB = 1 // only 1MB, because it can contain thousands of students

export const CSV_MIME_TYPE = 'text/csv'
export const EXCEL_MIME_TYPE = 'application/vnd.ms-excel'
export const EXCEL_XLSX_MIME_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const ACCEPTED_IMPORT_FILE_TYPES = [
    CSV_MIME_TYPE,
    EXCEL_MIME_TYPE,
    EXCEL_XLSX_MIME_TYPE,
]
