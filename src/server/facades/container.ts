import ContainerService from "#shared/services/ContainerService.ts";

const container = (globalThis as any).serverContainer || new ContainerService()

globalThis.serverContainer = container

export default container as ContainerService
