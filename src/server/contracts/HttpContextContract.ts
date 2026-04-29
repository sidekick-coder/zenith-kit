
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import type UploadService from '#server/services/upload.service.ts'
import type CookieService from '#shared/services/cookie.service.ts'
import type Acl from '#server/entities/acl.entity.ts'

export interface Request extends ExpressRequest {}
export interface Response extends ExpressResponse {}

export interface HttpContext {
    url: string;
    method: string;
    params: Record<string, string>
    query: Record<string, string | string[]>
    body: any
    cookie: CookieService
    upload: UploadService
    acl: Acl
    request: Request;
    response: Response;
    [key: string]: any; // Allow additional properties
}

export {}
