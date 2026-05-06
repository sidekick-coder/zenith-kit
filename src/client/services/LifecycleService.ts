import LifecycleHook from '#shared/entities/LifecycleHook.ts';
import BaseLifecycleService from '#shared/services/LifecycleService.ts';

export default class LifecycleService extends BaseLifecycleService {
    public addImports(imports: Record<string, any>){
        const hooks: LifecycleHook[] = []

        for (const [name, mod] of Object.entries(imports)) {
            const HookClass = mod.default || mod
            const instance = new HookClass() as LifecycleHook

            instance.hook_id = instance.hook_id || name

            hooks.push(instance)
        }

        hooks.forEach(hook => this.add(hook))
    }
}
