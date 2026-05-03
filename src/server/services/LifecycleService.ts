import { importAll } from '#server/utils/importAll.ts';
import LifecycleHook from '#shared/entities/LifecycleHook.ts';
import BaseLifecycleService from '#shared/services/LifecycleService.ts';

export default class LifecycleService extends BaseLifecycleService {
    public async addDirectory(dirname: string) {
        const mods = await importAll(dirname)
        const hooks: LifecycleHook[] = []

        for (const [name, mod] of Object.entries(mods)) {
            const HookClass = mod.default || mod
            const instance = new HookClass() as LifecycleHook

            instance.hook_id = instance.hook_id || name

            hooks.push(instance)
        }

        hooks.forEach(hook => this.add(hook))
    }
}
