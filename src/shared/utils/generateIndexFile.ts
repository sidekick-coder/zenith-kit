import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

// generate indexes for folders 
export function generateIndexFile(options: any) {
    const folders = options.folders
    const filename = options.filename

    let content = ''

    for (const folder of folders) {
        const files = fg.sync(`${folder}/**/*.ts`, { ignore: ['**/index.ts'] })

        for (const file of files) {
            const filePath = path.relative(path.dirname(filename), file)

            const hasDefaultExport = fs.readFileSync(file, 'utf-8').includes('export default') && !filePath.includes('generateIndexFile.ts')

            content += `export * from './${filePath}'\n`
            // default export 
            if (hasDefaultExport) {
                content += `export { default as ${path.basename(file, '.ts')} } from './${filePath}'\n`
            }
        }
    }

    content = content.trim()

    fs.writeFileSync(filename, content)
}
