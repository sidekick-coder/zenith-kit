import cosmicconfig from 'cosmiconfig'
import path from 'path'

const explorer = cosmicconfig.cosmiconfigSync('zenith', {
    searchPlaces: [
        'zenith.config.js',
        'zenith.config.yml',
        'zenith.config.yaml',
    ]
})


const result = explorer.search()

const config = result?.config || {}

export const kitConfig = {
    ...config?.kit,
    module_id: result?.config?.kit?.module_id || path.basename(process.cwd()),
}

export default config

