import ShellService from '#server/services/ShellService.ts'
import container from './container'

const shell = container.proxy<ShellService>(ShellService)

export default shell
