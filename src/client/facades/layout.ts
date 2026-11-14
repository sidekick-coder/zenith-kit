import LayoutService from "#client/services/LayoutService.ts";
import container from "./container.ts";

const layout = container.proxy<LayoutService>(LayoutService)

export default layout
