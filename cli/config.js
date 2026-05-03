import cosmicconfig from 'cosmiconfig'

const config = cosmicconfig.cosmiconfigSync('zkit', {
    searchPlaces: [
        'zkit.config.js',
        'zkit.config.yml',
        'zkit.config.yaml',
    ]
})

const result = config.search()

export default result?.config ? result.config : {}

