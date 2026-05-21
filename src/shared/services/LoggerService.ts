/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

export default class LoggerService {
    public static __container_entry_key = 'LoggerService' 

    public info(message: string, meta?: any): void {
        // Implementation here
    }
    
    public debug(message: string, meta?: any): void {
        // Implementation here
    }
    
    public warn(message: string, meta?: any): void {
        // Implementation here
    }
    
    public error(message: string | Error, meta?: any): void {
        // Implementation here
    }

    public child(options: any): LoggerService {
        // Implementation here
        return new LoggerService()
    }
}
