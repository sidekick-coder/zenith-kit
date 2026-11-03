import container from './container.ts'
import AuthService from '#server/services/AuthService.ts'

const auth = container.proxy<AuthService>(AuthService)

export default auth
