
// import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
// import type UploadService from '#server/services/upload.service.ts'
// import type CookieService from '#shared/services/cookie.service.ts'
import type Acl from '#server/entities/AclEntity.ts'

export interface Request {
    [key: string]: any; // Allow additional properties
}
export interface Response {
    [key: string]: any; // Allow additional properties
}

export interface HttpContext {
    url: string;
    method: string;
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: any
    upload: any
    acl: Acl
    request: Request;
    response: Response;
    [key: string]: any; // Allow additional properties
}

export {}
