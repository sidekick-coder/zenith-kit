import fs from 'fs'
import path from 'path'
import RouterService from './RouterService.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import type Route from '#server/entities/RouteEntity.ts'

export interface RouterRegisterEntry {
    filepath: string
    metadata: Record<string, any>
}

export default class RouterRegister<C = {}> extends RouterService<C> {
    public files = new Map<string, RouterRegisterEntry>()
    public dirs = new Map<string, RouterRegisterEntry>()
    
    constructor(router: Partial<RouterService<C>> = {}) {
        super(router)
    }

    public addFile(filename: string, metadata?: Record<string, any>) {
        const entry = {
            filepath: filename,
            metadata: metadata || {}
        }

        this.emit('addEntry', entry)

        this.files.set(filename, entry)

    }

    public addDir(dirname: string, metadata?: Record<string, any>) {
        const entry = {
            filepath: dirname,
            metadata: metadata || {}
        }

        this.emit('addEntry', entry)

        this.dirs.set(dirname, entry)
    }

    private async loadFile(entry: RouterRegisterEntry): Promise<boolean> {        
        if (!fs.existsSync(entry.filepath)) {
            this.logger.warn(`File not found: ${entry.filepath}`)
            return false
        }

        const hook = function(route: Route){
            route.metadata = {
                ...route.metadata,
                ...entry.metadata,
                filename: entry.filepath,
            }
        }
    
        const unached = `${entry.filepath}?t=${Date.now()}` // Prevent caching issues

        this.on('added', hook)
    
        const [error] = await tryCatch(() => import(unached))

        this.off('added', hook)
    
        if (error) {
            Object.assign(error, entry)

            this.logger.error('failed to load file', error)

            return false
        }

        return true
    }

    private async loadDir(entry: RouterRegisterEntry): Promise<string[]> {
        const loaded: Set<string> = new Set()

        if (!fs.existsSync(entry.filepath)) {
            this.logger.warn(`Directory not found: ${entry.filepath}`)
            return Array.from(loaded)
        }

        const files = fs.readdirSync(entry.filepath)
            
        for (const file of files) {
            // ignore test files
            if (file.endsWith('.test.ts') || file.endsWith('.spec.ts') || file.endsWith('.test.js') || file.endsWith('.spec.js')) {
                continue
            }

            const fullPath = path.join(entry.filepath, file)
                
            const fileRouterRegisterEntry = { 
                filepath: fullPath,
                metadata: entry.metadata 
            }

            if ((await this.loadFile(fileRouterRegisterEntry))) {
                loaded.add(fullPath)
            }
        }

        return Array.from(loaded)
    }

    public async load() {
        const loaded = new Set<string>()

        for (const e of this.files.values()) {
            if ((await this.loadFile(e))) {
                loaded.add(e.filepath)
            }
        }

        for (const dir of this.dirs.values()) {
            const dirLoaded = await this.loadDir(dir)

            dirLoaded.forEach(p => loaded.add(p))
        }

        if (this.debug) {
            this.logger.debug('load files', {
                files: Array.from(loaded).map(p => path.relative(process.cwd(), p)),
            })
        }
    }
}
