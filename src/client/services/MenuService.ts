import MenuItem from '#client/entities/MenuItemEntity.ts'
import acl from '#client/facades/acl.ts'

export interface ListFilter {
    layout?: string
    group?: string
    parent?: string 
    allowed?: boolean
}

export default class MenuService {
    public items: Map<string, MenuItem> = new Map()

    public add(...item: Omit<Partial<MenuItem>, 'merge' | 'from'>[]) {
        for (const i of item) {

            if (!i.id) {
                i.id = JSON.stringify(i)
            }

            this.items.set(i.id, MenuItem.from(i))
        }
    }

    public remove(id: MenuItem['id']) {
        this.items.delete(id)
    }

    public list(filter: ListFilter = {}) {
        let items = JSON.parse(JSON.stringify(Array.from(this.items.values()))) as MenuItem[]
        

        if (filter.layout) {
            items = items.filter(i => i.layout === filter.layout)
        }

        if (filter.group) {
            items = items.filter(i => i.group === filter.group || i.parent === filter.group)
        }

        if (filter.parent) {
            items = items.filter(i => i.parent === filter.parent)
        }

        if (filter.allowed !== undefined && filter.allowed === true) {
            items = items.filter(i => acl.can('view', i))
        }

        items.sort((a, b) => {
            const orderA = a.order ? a.order : 98
            const orderB = b.order ? b.order : 98

            return orderA - orderB
        })

        return items
    }

    public clear() {
        this.items.clear()
    }
}
