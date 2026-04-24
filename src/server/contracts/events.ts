export interface Events {
  'user:before-create': { user: any }
  'user:after-create': { user: any }
  'user:before-update': { user: any }
  'user:after-update': { user: any }
  'user:before-delete': { user: any }
  'user:after-delete': { user: any }
  // [key: string]: any
}

export {}
