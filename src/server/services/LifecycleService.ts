import { importAll } from '#server/utils/importAll.ts';
import LifecycleHook from '#shared/entities/LifecycleHook.ts';
import BaseLifecycleService from '#shared/services/LifecycleService.ts';

export default class LifecycleService extends BaseLifecycleService {
    public async addDirectory(dirname: string) {
        const mods = await importAll(dirname)

        const hooks: LifecycleHook[] = Object.values(mods)
            .map(m => m.default || m)
            .map((m: any) => new m())

        hooks.forEach(hook => this.add(hook))
    }
}
