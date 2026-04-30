import { ContainerService } from "#shared/index.ts";

const container = (globalThis as any).container || new ContainerService()

export default container as ContainerService
