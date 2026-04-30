import type { HttpContext } from "#server/contracts/HttpContextContract.ts";

export function defineHandler(handler: (ctx: HttpContext) => Promise<any>) {
    return handler
}
