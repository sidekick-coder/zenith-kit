export default class BaseException extends Error {
    public status: number = 500

    constructor(message: string, status: number = 500) {
        super(message)
        this.name = 'BaseException'
        this.status = status
    }

    public static fromError(error: Error): BaseException {
        return new BaseException(error.message, 500)
    }
}
