import { defineAsyncComponent } from 'vue'
import DashboardWidgetDefinition from './DashboardWidgetDefinition.ts'
import { defineFormFields } from '#client/utils/defineFormFields'
import type { DashboardWidgetData } from '../../../dist/client/src/client/index'

export default class extends DashboardWidgetDefinition {
    constructor() {
        super()
        this.id = 'text'
        this.name = 'Text'
        this.description = $t('Add a text widget to your dashboard.')
    }

    public async boot() {
        this.settings({
            fields: this.fields(),
            values: this.values(),
        })
    }

    public component() {
        return defineAsyncComponent(() => import('#client/components/WidgetTextRender.vue'))
    }

    public values(): Record<string, any> {
        return {}
    }

    public fields() {
        return defineFormFields({
            text: {
                component: 'textarea',
                label: $t('Text'),
                placeholder: $t('Enter your text here...'),
            },
            size: {
                component: 'text-field',
                type: 'number',
                label: $t('Size'),
            },
            color: {
                component: 'color-picker',
                label: $t('Color'),
            }
        })
    }

    public async text(payload: DashboardWidgetData['options']): Promise<string> {
        return payload.text || ''
    }
}

