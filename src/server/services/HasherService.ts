import bcrypt from 'bcrypt'

export default class HasherService {
    public static __container_entry_key = 'HasherService'

    public hash(value: string): Promise<string> {
        return bcrypt.hash(value, 12)
    }

    async compare(a: string, b: string): Promise<boolean> {
        return bcrypt.compare(a, b)
    }
}

