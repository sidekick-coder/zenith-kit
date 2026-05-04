import CookieMapEntity from "#server/entities/CookieMapEntity.ts"
import ContainerService from "#shared/services/ContainerService.ts"
import type { Request, Response } from 'express'
import type { ResolvableHead } from '@unhead/vue'
import ConfigService from "#shared/services/ConfigService.ts"

export interface PageRequestContextEntityOptions {
    url: string;
    request: Request;
    response: Response;

    state?: Map<string, any>

    nodeContainer?: ContainerService
    nodeConfig?: ConfigService
    nodeState?: Map<string, any>

    browserContainer?: ContainerService
    browserConfig?: ConfigService
    browserState?: Map<string, any>
}

export default class PageRequestContextEntity {
    public url: string;
    public request: Request;
    public response: Response;
    public cookies: CookieMapEntity
    public head: ResolvableHead[]

    public nodeContainer: ContainerService
    public nodeConfig: ConfigService
    public nodeState: Map<string, any>

    public browserContainer: ContainerService
    public browserConfig: ConfigService
    public browserState: Map<string, any>


    constructor(data: PageRequestContextEntityOptions) {
        this.url = data.url
        this.request = data.request
        this.response = data.response
        this.cookies = new CookieMapEntity(this.request, this.response)

        this.head = []

        this.nodeContainer = data.nodeContainer || new ContainerService()
        this.nodeConfig = data.nodeConfig || new ConfigService()
        this.nodeState = data.nodeState || new Map<string, any>()

        this.browserConfig = data.browserConfig || new ConfigService()
        this.browserContainer = data.browserContainer || new ContainerService()
        this.browserState = data.browserState || new Map<string, any>()
    }

    public setBrowserState(key: string, value: any) {
        this.browserState.set(key, value)
    }

    public setNodeState(key: string, value: any) {
        this.nodeState.set(key, value)
    }

    public setState(key: string, value: any) {
        this.setNodeState(key, value)
        this.setBrowserState(key, value)
    }

    public setBrowserContainerValue(key: string, value: any) {
        this.browserContainer.set(key, value)
    }

    public setNodeContainerValue(key: string, value: any) {
        this.nodeContainer.set(key, value)
    }

    public setContainerValue(key: string, value: any) {
        this.setNodeContainerValue(key, value)
        this.setBrowserContainerValue(key, value)
    }

}
