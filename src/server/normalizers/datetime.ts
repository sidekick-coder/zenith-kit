import { format } from 'date-fns'
import db from '#server/facades/database.ts'

export function toDb(value: Date | string | null): string | null {
    if (value === null) {
        return null
    }

    if (db.driver === 'sqlite') {
        return format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
    }

    if (db.driver === 'mysql') {
        return format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
    }

    return new Date(value).toISOString()
}

export function fromDb(value: string | null): Date | null {    
    if (value === null) {
        return null
    }

    return new Date(value)
}
