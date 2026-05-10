export function toDb(value: object | any[]): string | null {
    if (value === null) {
        return null
    }

    return JSON.stringify(value)
}

export function fromDb(value: any): object | any[] | null {
    if (value === null) {
        return null
    }

    return JSON.parse(value)
}
