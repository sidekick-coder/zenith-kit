import config from "#server/facades/config.ts";
import DriveConfigEntity from "#shared/entities/DriveConfigEntity.ts";

export interface DiskRepositoryQueryOptions { }

export default class DiskRepository {
    public async findMany(): Promise<DriveConfigEntity[]> {
        const record = config.get<Record<string, any>>('drive.disks', {})

        const items = Object.entries(record).map(([id, data]) => ({
            id,
            ...data
        }))

        return items.map(item => new DriveConfigEntity(item))
    }
}
