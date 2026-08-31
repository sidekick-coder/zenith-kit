import cosmicconfig from 'cosmiconfig'

export function getPluginConfig(dir?: string) {
    const explorer = cosmicconfig.cosmiconfigSync('zenith', {
        searchPlaces: [
            'zenith.config.js',
            'zenith.config.yml',
            'zenith.config.yaml',
        ]
    })


    const result = explorer.search(dir)

    const config = result?.config || {}

    return config
}

