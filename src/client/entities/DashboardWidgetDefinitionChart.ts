import DashboardWidgetDefinition from './DashboardWidgetDefinition'
import type DashboardWidgetData from './DashboardWidgetData'

/**
    * Component to be used for chart widgets in the dashboard.
    * Plugins can extend this class to create their own chart widgets.
    * @example
    * class MyChartWidget extends DashboardWidgetDefinitionChart {
    *     constructor() {
    *         super()
    *         this.name = 'My Chart Widget'
    *         this.id = 'my-chart-widget'
    *     }
    * }
    */


export default class DashboardWidgetDefinitionChart extends DashboardWidgetDefinition {
    private static renderer: any 

    constructor() {
        super()
        this.name = 'Chart'
        this.id = 'chart'
    }

    public static setRenderer(renderer: any) {
        DashboardWidgetDefinitionChart.renderer = renderer
    }

    public component() {
        return DashboardWidgetDefinitionChart.renderer
    }

    // return chart options for the chart widget. This can be overridden by plugins to provide custom chart options.
    // @ts-expect-error to be extended later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async chartOptions(payload: DashboardWidgetData['options']): Promise<any>{
        return {
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true 
            },
            title: { text: 'ECharts Getting Started Example' },
            tooltip: {},
            xAxis: { data: ['shirt', 'cardigan', 'chiffon', 'pants', 'heels', 'socks'] },
            yAxis: {},
            series: [
                {
                    name: 'sales',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }
            ]
        }
    }
}
