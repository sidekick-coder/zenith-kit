// import bcrypt from 'bcrypt'

export default class HasherService {
    public static __container_entry_key = 'HasherService'

    public async hash(value: string): Promise<string> {
        const bcrypt = await import('bcrypt')

        return bcrypt.hash(value, 12)
    }

    async compare(a: string, b: string): Promise<boolean> {
        const bcrypt = await import('bcrypt')

        return bcrypt.compare(a, b)
    }
}

