import type { UnionToIntersection } from './typing.ts'

export type AnyClass = new (...args: any[]) => any
export type Constructor<T = {}> = new (...args: any[]) => T
export type Mixin<T> = (base: Constructor) => Constructor<T>

/**
 * Composes multiple mixins into a single class that can be extended.
 * Allows for multiple inheritance-like behavior by applying mixins sequentially.
 * 
 * @param mixins - Array of mixin functions to compose
 * @returns A class constructor that includes all mixin functionality
 * 
 * @example
 * ```typescript
 * class User extends compose(Timestamp, SoftDelete) {
 *   constructor(public name: string) {
 *     super()
 *   }
 * }
 * ```
 */
export function compose<
    M extends Array<(base: Constructor<any>) => Constructor<any>>
>(...mixins: M): UnionToIntersection<ReturnType<M[number]>> {
    return mixins.reduce((base, mixin) => mixin(base), class {} as any) as any
}

/**
 * Alternative compose function that starts with a base class
 * 
 * @param baseClass - The base class to start with
 * @param mixins - Array of mixin functions to apply
 * @returns A class constructor that extends the base class with all mixin functionality
 * 
 * @example
 * ```typescript
 * class User extends composeWith(BaseEntity, Timestamp, SoftDelete) {
 *   constructor(public name: string) {
 *     super()
 *   }
 * }
 * ```
 */
export function composeWith<
    TBase extends Constructor,
    M extends Array<(base: Constructor) => Constructor<any>>
>(
    baseClass: TBase,
    ...mixins: M
): TBase & UnionToIntersection<ReturnType<M[number]>> {
    return mixins.reduce((base, mixin) => mixin(base), baseClass as any) as any
}

export function mixin<TBase extends Constructor>(Source: TBase) {
    return function <TTarget extends Constructor>(Target: TTarget) {
        class Mixed extends Target {
            constructor(...args: any[]) {
                super(...args)
                const source = new Source(...args)
                Object.assign(this, source)
            }
        }

        // Copy methods
        for (const key of Reflect.ownKeys(Source.prototype)) {
            if (key !== 'constructor') {
                Object.defineProperty(
                    Mixed.prototype,
                    key,
                    Object.getOwnPropertyDescriptor(Source.prototype, key)!
                )
            }
        }

        return Mixed as TTarget & TBase
    }
}
