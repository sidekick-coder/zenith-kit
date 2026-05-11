import type Router from './RouterService.ts'
import type { Middleware } from '#server/contracts/RouterContract.ts'
import { compose } from '#shared/utils/compose.ts'
import Hooks from '#shared/mixins/HooksMixin.ts'
import type Route from '#server/entities/RouteEntity.ts'
import type { HttpContext } from '#server/contracts/HttpContextContract.ts'

export type ResourceMethod = 'index' | 'show' | 'store' | 'update' | 'destroy'

export interface RouterResourceOptions {
    middleware?: Partial<Record<ResourceMethod | 'all', Middleware>>
    except?: ResourceMethod[]
}

const routes = [
    {
        method: 'get',
        path: '/',
        handler: 'index',
        hooks: {
            before: ['beforeIndex'],
            after:  ['afterIndex'],
        }
    },
    {
        method: 'get',
        path: '/:id',
        handler: 'show',
        hooks: {
            before: ['beforeShow'],
            after:  ['afterShow'],
        }
    },
    {
        method: 'post',
        path: '/',
        handler: 'store',
        hooks: {
            before: ['beforeStore', 'beforeSave'],
            after:  ['afterStore', 'afterSave'],
        }
    },
    {
        method: 'put',
        path: '/:id',
        handler: 'update',
        hooks: {
            before: ['beforeUpdate', 'beforeSave'],
            after:  ['afterUpdate', 'afterSave'],
        }
    },
    {
        method: 'patch',
        path: '/:id',
        handler: 'update',
        hooks: {
            before: ['beforeUpdate', 'beforeSave'],
            after:  ['afterUpdate', 'afterSave'],
        }
    },
    {
        method: 'delete',
        path: '/:id',
        handler: 'destroy',
        hooks: {
            before: ['beforeDestroy'],
            after:  ['afterDestroy'],
        }
    },
]


export default class RouterResourceService extends compose(Hooks) {
    private options: RouterResourceOptions

    constructor(options: RouterResourceOptions = {}) {
        super()
        this.options = options
    }

    public async index(ctx: HttpContext): Promise<any> {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async show(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async store(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async update(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    public async destroy(ctx: HttpContext): Promise<any>  {
        const error = new Error('Not implemented')

        Object.assign(error, { ctx })

        throw error
    }

    private wrap(
        methodName: 'index' | 'show' | 'store' | 'update' | 'destroy',
        before: string[],
        after: string[],
    ) {
        return async (ctx: HttpContext) => {
            await this.emit('beforeAll', ctx)

            for (const hook of before) {
                await this.emit(hook, ctx)
            }

            const result = await this[methodName](ctx)

            for (const hook of after) {
                await this.emit(hook, ctx, result)
            }

            return result
        }
    }


    public register(router: Router) {
        for (const route of routes) {
            const method = route.method as Route['method']
            const methodName = route.handler as ResourceMethod
            
            if (this.options.except && this.options.except.includes(methodName)) {
                continue
            }

            if (this.options.middleware && this.options.middleware['all']) {
                router.use(this.options.middleware['all'])
            }

            if (this.options.middleware && this.options.middleware[methodName]) {
                router.use(this.options.middleware[methodName])
            }

            router[method](
                route.path,
                this.wrap(
                    route.handler as any,
                    route.hooks?.before || [],
                    route.hooks?.after || [],
                )
            )
        }
    }
}
