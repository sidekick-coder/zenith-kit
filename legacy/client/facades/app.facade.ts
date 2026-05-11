import { container } from '@sidekick-coder/zenith-kit/client'
import type { App } from 'vue'

const app = container.proxy<App>('app')

export default app
