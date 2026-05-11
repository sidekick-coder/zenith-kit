import database from '#server/facades/database.ts'

const db = database as any

export function toDb(value: boolean | number | null) {
    if (value === null) {
        return null
    }

    const dialect = db.currentConnectionDialectName

    if (dialect === 'sqlite') {
        return value ? 1 : 0
    }

    return value ? true : false
}

export function fromDb(value: any | null): boolean | null {    
    if (value === null) {
        return null
    }

    const dialect = db.currentConnectionDialectName

    if (dialect  === 'sqlite') {
        return value === 1 ? true : false
    }

    return value === 'true' ? true : false
}
