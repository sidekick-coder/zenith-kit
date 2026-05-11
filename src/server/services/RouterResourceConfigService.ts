import RouterResourceService from './RouterResourceService.ts'
import type { RouterResourceOptions } from './RouterResourceService.ts'
import type { HttpContext } from '#server/contracts/HttpContextContract.ts'
import type { ConfigModel } from '#server/mixins/ModelConfigMixin.ts'


export default class RouterResourceConfig extends RouterResourceService {
    private model: ConfigModel

    constructor(model: ConfigModel, options: RouterResourceOptions = {}) {
        super(options)

        if (!model.__isConfigModel) {
            throw new Error('RouterResourceConfigService requires a ConfigModel')
        }

        this.model = model
    }

    // @ts-expect-error - We know this is correct, but TypeScript can't infer it 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async index(ctx: HttpContext) {
        const items = await this.model.list()

        return {
            items: items
        }
    }

    public async show(ctx: HttpContext) {
        const id = ctx.params.id!

        const item = await this.model.findOrFail(id)

        return item
    }

    public async store(ctx: HttpContext) {
        const data = ctx.request.body as any

        await this.model.create(data)

        return {
            message: 'Resource created successfully'
        }
    }

    public async update(ctx: HttpContext) {
        const id = ctx.params.id!
        const data = ctx.request.body as any

        const updated = await this.model.update(id, data)

        return updated
    }

    public async destroy(ctx: HttpContext) {
        const id = ctx.params.id!

        await this.model.destroy(id)

        return {
            success: true,
        }
    }
}
