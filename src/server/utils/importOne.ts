import { pathToFileURL } from 'node:url'
import fs from 'node:fs'

export async function importOne(filenames: string[]): Promise<any> {
    for (const filename of filenames) {
        const fileUrl = pathToFileURL(filename)

        if (!fs.existsSync(filename)) {
            continue
        }

        const mod = await import(fileUrl.toString())

        return mod
    }

    return null
}
