#!/usr/bin/env node

import { Command } from 'commander'
import { readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const program = new Command()

program
    .name('zkit')
    .description('CLI tool for zenith-kit')

const commandsDir = resolve(__dirname, '..', 'cli', 'commands')

for (const file of readdirSync(commandsDir)) {
    if (!file.endsWith('.js')) continue

    const mod = await import(pathToFileURL(resolve(commandsDir, file)).href)

    program.addCommand(mod.default)
}

program.parse(process.argv)
