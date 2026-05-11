import { Command } from 'commander'
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname, relative, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const command = new Command('generate-legacy-folder')

command
    .description('Copy all files from the package legacy/ folder into CWD/legacy/')
    .action(() => {
        const cwd = process.cwd()
        const srcDir = resolve(__dirname, '../../legacy')
        const destDir = resolve(cwd, 'legacy')

        const copyRecursive = (dir) => {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
                const srcPath = join(dir, entry.name)
                const relPath = relative(srcDir, srcPath)
                const destPath = join(destDir, relPath)

                if (entry.isDirectory()) {
                    mkdirSync(destPath, { recursive: true })
                    copyRecursive(srcPath)
                } else {
                    mkdirSync(dirname(destPath), { recursive: true })
                    writeFileSync(destPath, readFileSync(srcPath))
                    console.log(`wrote ${relPath}`)
                }
            }
        }

        copyRecursive(srcDir)
        console.log('Legacy folder generated at', destDir)
    })

export default command
