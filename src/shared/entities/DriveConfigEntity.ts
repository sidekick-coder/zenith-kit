export const TYPES = () => [
    {
        id: 'fs',
        label: $t('File System'),
        description: $t('Store files on the local file system.'),
        config_fields: {
            directory: {
                component: 'text-field',
                label: $t('Directory'),
                description: $t('The directory path where files will be stored.'),
                hint: $t('Relative to the application root or absolute path, e.g., :0  or :1', ['/var/zenith/uploads', 'storage/uploads']),
            }
        }
    },
    {
        id: 's3',
        label: 'S3',
        description: $t('Store files on an S3-compatible service like AWS S3, DigitalOcean Spaces, etc.'),
        config_fields: {
            accessKeyId: {
                component: 'text-field',
                label: $t('Access Key ID'),
                hint: $t('Your AWS access key ID.'),
                type: 'password',
            },
            secretAccessKey: {
                component: 'text-field',
                label: $t('Secret Access Key'),
                hint: $t('Your AWS secret access key.'),
                type: 'password',
            },
            bucket: {
                component: 'text-field',
                label: $t('Bucket Name'),
                hint: $t('The name of the S3 bucket to store files in.'),
            },
            region: {
                component: 'text-field',
                label: $t('Region'),
                hint: $t('The AWS region where your bucket is located.'),
            },
            prefix: {
                component: 'text-field',
                label: $t('Prefix'),
                hint: $t('An optional prefix (folder path) to store files under in the bucket.'),
            },
            endpoint: {
                component: 'text-field',
                label: $t('Endpoint URL'),
                hint: $t('Optional custom endpoint URL for S3-compatible services.'),
            },
        }
    }
]
export default class DriveConfig {
    public static get TYPES() {
        return TYPES()
    }
    
    public id: string
    public name: string
    public type: string
    public is_default: boolean
    public config: Record<string, any>

    constructor(data: DriveConfig){
        Object.assign(this, data)
    }

    public get config_fields() {
        const option = DriveConfig.TYPES.find(opt => opt.id === this.type)

        return option ? option.config_fields : {}
    }
}