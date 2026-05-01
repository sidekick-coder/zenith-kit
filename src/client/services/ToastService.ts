export default class ToastService {
    public success(message: string, options?: Record<string, any>) {
        console.log('Success:', message, options)
    }

    public error(message: string, options?: Record<string, any>) {
        console.error('Error:', message, options)
    }
}
