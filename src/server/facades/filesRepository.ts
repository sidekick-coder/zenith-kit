import FileRepository from "#server/repositories/FileRepository.ts";
import database from "./database.ts";

const fileRepository = new FileRepository(database)

export default fileRepository
