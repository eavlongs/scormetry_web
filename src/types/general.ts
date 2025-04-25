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
