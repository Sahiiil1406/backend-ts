class ApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;

    constructor(statusCode: number, success: boolean, message: string, data?: T) {
        this.statusCode = statusCode;
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static success<T>(data: T, message: string = "Success", statusCode: number = 200): ApiResponse<T> {
        return new ApiResponse<T>(statusCode, true, message, data);
    }

    static error(message: string, statusCode: number = 400, data: any = null): ApiResponse<null> {
        return new ApiResponse<null>(statusCode, false, message, data);
    }
}

export { ApiResponse };
