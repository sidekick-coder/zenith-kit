import BaseException from './BaseException.ts'

export default class ShellException extends BaseException {
    public output: string
    public bin: string 
    public args: string[]

    constructor(message: string, output: string, bin: string, args: string[]) {
        super(message, 501)

        this.output = output
        this.bin = bin 
        this.args = args 
    }
}
