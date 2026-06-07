import EnvService from "#server/services/EnvService.ts"
import container from "./container"

const env = container.proxy<EnvService>(EnvService)

export default env

