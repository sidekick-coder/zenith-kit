import MenuService from '#client/services/MenuService.ts'
import container from './container'

const menu = container.proxy<MenuService>(MenuService)

export default menu
