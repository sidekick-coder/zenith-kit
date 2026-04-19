import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

// generate indexes for folders 

function generate(options) {
    const folders = options.folders
    const filename = options.filename

    let content = ''

    for (const folder of folders) {
        const files = fg.sync(`${folder}/**/*.ts`, { ignore: ['**/index.ts'] })

        console.log(files)

        for (const file of files) {
            const filePath = path.relative(path.dirname(filename), file)

            content += `export * from './${filePath}'\n`
        }
    }

    content = content.trim()

    fs.writeFileSync(filename, content)
}


generate({
    folders: ['src/shared/services', 'src/shared/utils'],
    filename: 'src/shared/index.ts'
})
