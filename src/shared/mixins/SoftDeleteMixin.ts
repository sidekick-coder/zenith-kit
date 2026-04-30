import type { Constructor } from '#shared/utils/compose.ts'

export default function SoftDeleteMixin<T extends Constructor>(base: T) {
    return class extends base {
        public deleted_at: Date | string | null = null
    }
}
