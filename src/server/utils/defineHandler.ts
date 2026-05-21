import type { HttpContext } from "#server/contracts/HttpContextContract.ts";

export interface Handler {
    (ctx: HttpContext): Promise<any> | (() => any)
}

export function defineHandler(handler: Handler): Handler {
    return handler
}
