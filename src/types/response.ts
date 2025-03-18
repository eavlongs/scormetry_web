export type ApiResponse<T = any> = {
    success: boolean;
    message: string;
    data: T;
};

export type ActionResponse = {
    success: boolean;
    message: string;
    error?: any;
};
