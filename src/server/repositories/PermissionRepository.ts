import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import { validator } from '#shared/index.ts'
import type { Permission } from '#shared/schemas/permissionSchema.ts'
import type { Expression, SqlBool } from 'kysely'
import type { SelectBuilder } from '../queries'

interface QueryOptionAssigment {
    type: string
    id: string
}

interface QueryOptions {
    id?: number | number[]
    search?: string
    assignment?: QueryOptionAssigment | QueryOptionAssigment[]
}

export default class PermissionRepository extends DatabaseRepository<
    Permission,
    Permission['id'],
    QueryOptions
> {
    constructor(db: DatabaseRepository['db']) {
        super(db, 'permissions', 'id')
    }

    public query(payload?: QueryOptions) {
        let qb = super.query(payload as any) as SelectBuilder<"permissions">

        const options = validator.validate(payload || {}, v => v.object({
            id: v.optional(v.extras.array(v.number()), []),
            search: v.optional(v.string()),
            assignment: v.optional(v.extras.array(v.object({
                type: v.string(),
                id: v.string()
            })), [])
        }))

        if (options.id.length) {
            qb = qb.where('id', 'in', options.id)
        }

        if (options.search) {
            qb = qb.where('name', 'like', `%${options.search}%`)
        }

        if (options.assignment.length) {
            qb = qb.where('id', 'in', q => {
                let sub = q.selectFrom('permissions_assignments').select('permission_id')

                sub = sub.where(eb => {
                    const ors: Expression<SqlBool>[] = []

                    for (const assignment of options.assignment) {
                        ors.push(
                            eb.and([
                                eb('assignable_type', '=', assignment.type),
                                eb('assignable_id', '=', assignment.id)
                            ])
                        )
                    }

                    return eb.or(ors)
                })

                return sub
            })
        }

        return qb
    }
}
