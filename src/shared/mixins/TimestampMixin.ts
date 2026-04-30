import type { Constructor } from '#shared/utils/compose.ts'

export default function TimestampMixin<T extends Constructor>(base: T) {
    return class extends base {
        public created_at: Date | string
        public updated_at: Date | string
    }
}
