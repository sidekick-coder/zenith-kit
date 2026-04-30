import BaseAcl from '#shared/entities/AclEntity.ts'
import BaseException from '#shared/exceptions/BaseException.ts'

export default class Acl extends BaseAcl {
    public authorize(action: string, subject: any, object?: Record<string, any>) {
        if (this.cannot(action, subject, object)) {
            const error = new BaseException('Unauthorized', 403)

            let subjectName = ''
            
            if (typeof subject === 'string') {
                subjectName = subject
            }

            if (subject && typeof subject === 'function' && subject.name) {
                subjectName = subject.name
            }

            if (subject && typeof subject === 'object' && subject.constructor && subject.constructor.name) {
                subjectName = subject.constructor.name
            }

            Object.assign(error, {
                action,
                subject: subjectName,
            })
            
            throw error
        }
    }
}
