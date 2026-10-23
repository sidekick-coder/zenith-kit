export interface DefinePlugin {
    load: () => Promise<void>
}

export function definePlugin(payload: DefinePlugin | DefinePlugin['load']) {
    let plugin: DefinePlugin | null = null

    if (typeof payload === 'function') {
        plugin = { load: payload }
    }

    if (typeof payload === 'object') {
        plugin = payload
    }

    if (!plugin){
        throw new Error('Invalid plugin definition. Must be a function or an object with a load method.')
    }

    return plugin
}
