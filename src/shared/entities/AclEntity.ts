import { defineAbility, subject as createSubject } from '@casl/ability'
import Permission from './PermissionEntity.ts'
import LoggerService from '#shared/services/LoggerService.ts'

export default class AclEntity {
    public ability: ReturnType<typeof defineAbility>
    public permissions: Permission[]
    public debug: boolean = false
    public logger: LoggerService

    constructor(data: Partial<AclEntity> = {}) {
        const permissions = data.permissions || []
        const perms = permissions.map((permission) => Permission.from(permission))

        
        this.permissions = perms
        this.debug = data.debug || false
        this.logger = data.logger || new LoggerService().child({ label: 'acl' })
        
        this.ability = defineAbility((can) => {
            perms.forEach((permission) => {
                can(permission.action, permission.subject, permission.parsedConditions)
            })
        })

        if (this.debug) {
            this.logger.debug('initialized in debug mode', {
                permissions: this.permissions,
            })
        }
    }

    public can(action: string, subject: any, object?: Record<string, any>) {

        if (!object) {
            return this.ability.can(action, subject)
        }

        const subjectWithObject = createSubject(subject, object)

        return this.ability.can(action, subjectWithObject)
    }

    public cannot(action: string, subject: any, object?: Record<string, any>) {
        if (!object) {
            return this.ability.cannot(action, subject)
        }

        const subjectWithObject = createSubject(subject, object)

        return this.ability.cannot(action, subjectWithObject)
    }

    public subject(subject: string, object: Record<string, any>) {
        return createSubject(subject, object)
    }
}
