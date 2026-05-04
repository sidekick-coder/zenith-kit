import type PageRequestContextEntity from "#server/entities/PageRequestContextEntity.ts"
import type { UserEntity } from "#shared/index.ts"

export interface EventContract {
  'user:before-create': { user: UserEntity }
  'user:after-create': { user: UserEntity }
  'user:before-update': { user: UserEntity }
  'user:after-update': { user: UserEntity }
  'user:before-delete': { user: UserEntity }
  'user:after-delete': { user: UserEntity }
  // [key: string]: any
  'page:request:start': PageRequestContextEntity
  'page:request:before-render': PageRequestContextEntity
  'page:request:after-render': PageRequestContextEntity
}

export {}
