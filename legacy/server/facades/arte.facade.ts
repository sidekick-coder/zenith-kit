import { CliService, container } from '@sidekick-coder/zenith-kit/server'

const arte = container.proxy<CliService>(CliService)

export default arte

