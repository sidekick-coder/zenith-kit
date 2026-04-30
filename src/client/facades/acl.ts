import container from '#client/facades/container.ts'
import AclEntity from '#shared/entities/AclEntity.ts'

const acl = container.proxy<AclEntity>(AclEntity)

export default acl
