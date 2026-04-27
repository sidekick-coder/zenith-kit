import type { FindManyOptions, PaginateOptions } from '#server/repositories/DatabaseRepository.ts'
import type { Constructor } from '#shared/utils/compose.ts'

export interface IRepositoryTypes<TEntity = Record<string, any>, TPrimaryKeyType = any, TOptions = Record<string, any>> {
    count(options?: TOptions): Promise<number>

    findMany(options?: TOptions & FindManyOptions): Promise<TEntity[]>
    findById(id: TPrimaryKeyType, options?: TOptions): Promise<TEntity | null>
    findByIdOrFail(id: TPrimaryKeyType, options?: TOptions): Promise<TEntity>

    paginate(options?: TOptions & PaginateOptions): Promise<{ items: TEntity[]; total: number }>

    create(data: Partial<TEntity>, options?: TOptions): Promise<TEntity>
    createMany(data: Partial<TEntity>[], options?: TOptions): Promise<TEntity[]> 

    deleteById(id: TPrimaryKeyType): Promise<void>
    destroyMany(options?: TOptions): Promise<void>
}

export default function DatabaseRepositoryInferMixin<TEntity = Record<string, any>, TPrimaryKeyType = any, TOptions = Record<string, any>>() {
    return function <TBase extends Constructor>(Base: TBase) {
        abstract class OptionsMixin extends Base {
            // We "declare" these methods so they exist in the type space
            // for this specific TOptions, without overriding the logic.
            abstract count(options?: TOptions): Promise<number>

            abstract findMany(options?: TOptions & FindManyOptions): Promise<TEntity[]>
            abstract findById(id: TPrimaryKeyType, options?: TOptions): Promise<TEntity | null>
            abstract findByIdOrFail(id: TPrimaryKeyType, options?: TOptions): Promise<TEntity>

            abstract paginate(options?: TOptions & PaginateOptions): Promise<{ items: TEntity[]; total: number }>

            abstract create(data: Partial<TEntity>, options?: TOptions): Promise<TEntity>
            abstract createMany(data: Partial<TEntity>[], options?: TOptions): Promise<TEntity[]>

            abstract deleteById(id: TPrimaryKeyType): Promise<void>
            abstract destroyMany(options?: TOptions): Promise<void>
        }

        return OptionsMixin as TBase & Constructor<IRepositoryTypes<TEntity, TPrimaryKeyType, TOptions>>
    }
}
