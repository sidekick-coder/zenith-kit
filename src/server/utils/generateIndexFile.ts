import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

// generate indexes for folders 
export function generateIndexFile(options: any) {
    const folders = options.folders
    const filename = options.filename
    const patterns = options.patterns || []
    const defaultIgnore = [
        "**/node_modules",
        "**/*.spec.ts",
        "**/*.spec-d.ts",
        "**/*.test.ts",
        "**/*.test-d.ts",
    ]

    if (options.folders) {
        for (const folder of folders) {
            patterns.push(`${folder}/**/*.ts`, `${folder}/**/*.js`)
        }
    }

    const ignore = options.ignore || []

    let content = ''

    const files = fg.sync(patterns, {
        ignore: [...defaultIgnore, ...ignore],
    })

    for (const file of files) {
        const filePath = path.relative(path.dirname(filename), file)
        const extension = path.extname(file)

        const fileContent = fs.readFileSync(file, 'utf-8')

        let shouldExportDefault = fileContent.includes('export default') && !filePath.includes('generateIndexFile.ts')

        if (file.endsWith('.vue')) {
            shouldExportDefault = true
        }

        content += `export * from './${filePath}'\n`

        // default export 
        if (shouldExportDefault) {
            content += `export { default as ${path.basename(file, extension)} } from './${filePath}'\n`
        }
    }

    content = content.trim()

    fs.writeFileSync(filename, content)
}
