import PluginService from "#server/services/PluginService.ts";
import container from "./container.ts";

const pluginService = container.proxy<PluginService>(PluginService);

export default pluginService;
