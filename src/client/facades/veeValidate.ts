import container from '#client/facades/container.ts'
import * as VeeValidate from 'vee-validate'

export const VEE_VALIDATE_CONTAINER_KEY = 'vee-validate'

const veeValidate = container.proxy<typeof VeeValidate>(VEE_VALIDATE_CONTAINER_KEY)

export default veeValidate
