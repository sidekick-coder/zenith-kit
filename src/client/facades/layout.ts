import LayoutManager from "#client/services/LayoutService.ts";

const g = globalThis as any

const layout = g.layout || new LayoutManager()

g.layout = layout

export default layout
