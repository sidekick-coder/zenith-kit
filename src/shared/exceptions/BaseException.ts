export default class BaseException extends Error {
    public statusCode: number = 500
    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
    }

    public static fromError(error: Error): BaseException {
        return new BaseException(error.message, 500)
    }
}