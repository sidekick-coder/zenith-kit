import PluginRepository from "#server/repositories/PluginRepository.ts";
import type LoggerService from "#shared/services/LoggerService.ts";
import type { ConfigService } from "#shared/index.ts";
import PluginDownloadService from "./PluginDownloadService";
import PluginUpdaterService from "./PluginUpdaterService";

export default class PluginService {
    public static __container_entry_key = 'PluginService'

    public repository: PluginRepository
    public downloader: PluginDownloadService
    public updater: PluginUpdaterService

    public logger: LoggerService
    public config: ConfigService
    public debug: boolean

    constructor() {
        this.repository = new PluginRepository()
        this.downloader = new PluginDownloadService()
        this.updater = new PluginUpdaterService()
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
        this.repository.setLogger(logger)
        this.downloader.setLogger(logger)
        this.updater.setLogger(logger)
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        this.repository.setDebug(debug)
        this.downloader.setDebug(debug)
        this.updater.setDebug(debug)
        return this
    }

    public setConfig(config: ConfigService) {
        this.config = config
        return this
    }

    public enable(id: string) {
        this.config.set(`plugins.registry.${id}.enabled`, true)
    }

    public disable(id: string) {
        this.config.set(`plugins.registry.${id}.enabled`, false)
    }

    public toggle(id: string) {
        if (this.config.get(`plugins.registry.${id}.enabled`)) {
            return this.disable(id)
        }

        return this.enable(id)
    }
}
