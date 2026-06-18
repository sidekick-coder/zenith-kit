export default class BaseRelation {

    async load(entities: any[]) {
        const error = new Error('Not implemented')

        Object.assign(error, { entities })

        throw error
    }
}