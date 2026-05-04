import CookieMapEntity from "#server/entities/CookieMapEntity.ts"
import ContainerService from "#shared/services/ContainerService.ts"
import type { Request, Response } from 'express'

export interface PageRequestContextEntityOptions {
    state?: Map<string, any>
    container?: ContainerService
    url: string;
    request: Request;
    response: Response;
}

export default class PageRequestContextEntity {
    public state: Map<string, any>
    public container: ContainerService
    public url: string;
    public request: Request;
    public response: Response;
    public cookies: CookieMapEntity

    constructor(data: PageRequestContextEntityOptions) {
        this.state = data.state || new Map<string, any>()
        this.container = data.container || new ContainerService()
        this.url = data.url
        this.request = data.request
        this.response = data.response

        this.cookies = new CookieMapEntity(this.request, this.response)
    }

}
