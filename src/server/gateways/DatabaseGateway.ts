import { Kysely } from "kysely";

export default class DatabaseGateway<DB> extends Kysely<DB> {
    public static __container_entry_key = 'DatabaseGateway'
}
