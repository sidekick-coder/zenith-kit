import type Permission from './PermissionEntity.ts'
import type Role from './RoleEntity.ts'
import { compose } from '#shared/utils/compose.ts'
import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import TimestampMixin from '#shared/mixins/TimestampMixin.ts'
import SoftDeleteMixin from '#shared/mixins/SoftDeleteMixin.ts'

export default class UserEntity extends compose(BaseEntity, TimestampMixin, SoftDeleteMixin) {  
    public id: number
    public email: string
    public name: string
    public username: string
    public password?: string
    public verified_at?: Date | string | null

    public permissions?: Permission[]
    public roles?: Role[]

    public get initials(){
        const [firstName, secondName] = this.name.split(' ')

        if (!secondName) {
            return firstName[0].toUpperCase()
        }

        const a = firstName[0].toUpperCase()
        const b = secondName[0].toUpperCase()

        return a + b
    }
}
