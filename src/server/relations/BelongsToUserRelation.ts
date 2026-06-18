import BelongsTo from './BelongsToRelation.ts'
import User from '#shared/entities/UserEntity.ts'

export default class BelongsToUser extends BelongsTo {
    constructor() {
        super({
            table: 'users',
            tableKey: 'id',
            
            targetTable: 'users',
            targetKey: 'user_id',

            property: 'user',
            serialize: row => User.from(row)
        })

    }
}
