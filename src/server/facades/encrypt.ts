import EncryptService from '#server/services/EncryptService.ts'
import container from './container.ts'

const encrypt = container.proxy<EncryptService>(EncryptService)

export default encrypt

