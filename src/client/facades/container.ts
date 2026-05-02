import ContainerService from "#shared/services/ContainerService.ts";

const container = (globalThis as any).clientContainer || new ContainerService()

globalThis.clientContainer = container

export default container as ContainerService
