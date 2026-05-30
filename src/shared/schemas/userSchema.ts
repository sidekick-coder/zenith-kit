import * as v from 'valibot'

function userSchema() {
    return v.object({
        id: v.number(),
        name: v.optional(v.string()),
        email: v.pipe(v.string(), v.email()),
        password: v.pipe(v.string(), v.minLength(6)),
        username: v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_-]+$/)),
        verified_at: v.nullable(v.string()),
        created_at: v.string(),
        updated_at: v.string(),
        deleted_at: v.nullable(v.string())
    })
}

userSchema.create = () => v.omit(userSchema(), ['id', 'verified_at', 'created_at', 'updated_at', 'deleted_at'])
userSchema.update = () => v.partial(userSchema.create())

export default userSchema
