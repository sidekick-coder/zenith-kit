import EmmitterService from '#shared/services/EmmitterService.ts'
import { set } from 'lodash-es'
import type DashboardWidgetData from './DashboardWidgetData'
import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import dashboardRegistry from '#client/facades/dashboardRegistry.ts'

export const DASHBOARD_ROW_HEIGHT = 80

interface DashboardWidgetOptions {
    data: DashboardWidgetData
    definition: DashboardWidgetDefinition
}

interface StylesOptions {
    contianerWidth: number
    breakpoint?: 'base' | 'sm' | 'md' | 'xl'
}

export default class DashboardWidget {
    public data: DashboardWidgetData
    public definition: DashboardWidgetDefinition
    public emmitter: EmmitterService

    constructor({ data, definition }: DashboardWidgetOptions) {
        this.data = data
        this.definition = definition
        this.emmitter = new EmmitterService()
    }

    public static fromData(data: DashboardWidgetData) {
        let def = dashboardRegistry.get(data.definition_id)

        if (!def) {
            def = new DashboardWidgetDefinition()
            def.name = `Unknown: ${data.definition_id}`
            def.id = data.definition_id

            console.warn(`DashboardWidgetDefinition not found for id: ${data.definition_id}. Using unknown definition.`)
        }

        return new DashboardWidget({
            data: data,
            definition: def,
        })
    }

    public setEmmitter(emmitter: EmmitterService) {
        this.emmitter = emmitter
    }

    public get id(): string {
        return this.data.id
    }

    public get name(): string {
        return this.data.name
    }

    public set name(value: string) {
        this.update({ name: value })
    }

    public get options(): DashboardWidgetData['options'] {
        return this.data.options || {}
    }


    public get definition_id(): string {
        return this.data.definition_id
    }

    public component() {
        return this.definition.component()
    }

    public actions() {
        return this.definition.actions()
    }

    public get columns(): DashboardWidgetData['columns'] {
        return this.data.columns || {}
    }

    public set columns(payload: DashboardWidgetData['columns']) {
        const columns = JSON.parse(JSON.stringify(this.data.columns || {})) as DashboardWidgetData['columns']

        Object.assign(columns, payload)

        this.update({ columns })
    }

    public get rows(): DashboardWidgetData['rows'] {
        return this.data.rows || {}
    }

    public set rows(payload: DashboardWidgetData['rows']) {
        const rows = JSON.parse(JSON.stringify(this.data.rows || {})) as DashboardWidgetData['rows']

        Object.assign(rows, payload)

        this.update({ rows })
    }

    public get x(): DashboardWidgetData['x'] {
        return this.data.x || {}
    }

    public set x(payload: DashboardWidgetData['x']) {
        const x = JSON.parse(JSON.stringify(this.data.x || {})) as DashboardWidgetData['x']

        Object.assign(x, payload)

        this.update({ x })
    }

    public get y(): DashboardWidgetData['y'] {
        return this.data.y || {}
    }

    public set y(payload: DashboardWidgetData['y']) {
        const y = JSON.parse(JSON.stringify(this.data.y || {})) as DashboardWidgetData['y']

        Object.assign(y, payload)

        this.update({ y })
    }

    public get classes(): string {
        const classes = new Set<string>()

        return Array.from(classes.values()).join(' ')
    }

    public computeStyles(options: StylesOptions): string {
        const styles = new Map<string, string>()
        const breakpoint = options.breakpoint ?? 'base'

        const x = this.x[breakpoint] ?? 0
        const y = this.y[breakpoint] ?? 0
        const cols = this.columns[breakpoint] ?? 1
        const rows = this.rows[breakpoint] ?? 1

        const colSize = options.contianerWidth / 12
        const rowSize = DASHBOARD_ROW_HEIGHT

        styles.set('position', 'absolute')
        styles.set('left', `${x * colSize}px`)
        styles.set('top', `${y * rowSize}px`)
        styles.set('width', `${cols * colSize - 10}px`) // padding and scrollbar compensation
        styles.set('height', `${rows * rowSize}px`)

        return Array.from(styles.entries())
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ')
    }

    public update(payload: Partial<DashboardWidgetData>) {
        Object.assign(this.data, payload)

        this.emmitter.emit('widget:updated', {
            id: this.id,
            data: this.data
        })
    }

    public setOption(key: string, value: any) {
        const options = JSON.parse(JSON.stringify(this.data.options || {}))

        set(options, key, value)

        this.update({ options })
    }

    public setX(breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl', value: number | undefined = undefined) {
        const x = JSON.parse(JSON.stringify(this.x)) as DashboardWidgetData['x']

        if (value === undefined) {
            delete x[breakpoint]
        }

        if (value !== undefined) {
            x[breakpoint] = value
        }

        this.update({ x })
    }

    public setY(breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl', value: number | undefined = undefined) {
        const y = JSON.parse(JSON.stringify(this.y)) as DashboardWidgetData['y']

        if (value === undefined) {
            delete y[breakpoint]
        }

        if (value !== undefined) {
            y[breakpoint] = value
        }

        this.update({ y })
    }

    public setColumn(breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl', value: number | undefined = undefined) {
        const columns = JSON.parse(JSON.stringify(this.columns)) as DashboardWidgetData['columns']

        if (value === undefined) {
            delete columns[breakpoint]
        }

        if (value !== undefined) {
            columns[breakpoint] = value
        }

        this.update({ columns })
    }

    public setRow(breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl', value: number | undefined = undefined) {
        const rows = JSON.parse(JSON.stringify(this.rows)) as DashboardWidgetData['rows']

        if (value === undefined) {
            delete rows[breakpoint]
        }

        if (value !== undefined) {
            rows[breakpoint] = value
        }

        this.update({ rows })
    }
}
