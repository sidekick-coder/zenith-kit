import container from '#client/facades/container.ts'
import ToastService from '#client/services/ToastService.ts'

const toast = container.proxy<ToastService>(ToastService)

export default toast
