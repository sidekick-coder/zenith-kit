import DriveService from '#server/services/DriveService.ts'
import container from './container.ts'

const drive = container.proxy<DriveService>(DriveService)

export default drive

