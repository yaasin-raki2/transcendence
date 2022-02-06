import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryRunner, Repository } from "typeorm";
import { DatabaseFile } from "../entities/databaseFile.entity";

@Injectable()
export class DatabaseFilesService {
	constructor(
		@InjectRepository(DatabaseFile)
		private readonly databaseRepository: Repository<DatabaseFile>
	) {}

	async uploadDatabaseFile(
		dataBuffer: Buffer,
		fileName: string
	): Promise<DatabaseFile> {
		const newFile = await this.databaseRepository.create({
			fileName,
			data: dataBuffer
		});
		await this.databaseRepository.save(newFile);
		return newFile;
	}

	async uploadDatabaseFileWithQueryRunner(
		dataBuffer: Buffer,
		fileName: string,
		queryRunner: QueryRunner
	): Promise<DatabaseFile> {
		const newFile = await queryRunner.manager.create(DatabaseFile, {
			fileName,
			data: dataBuffer
		});
		await queryRunner.manager.save(DatabaseFile, newFile);
		return newFile;
	}

	async deleteFileWithQueryRunner(
		fileId: number,
		queryRunner: QueryRunner
	): Promise<void> {
		const deleteResponse = await queryRunner.manager.delete(DatabaseFile, fileId);
		if (!deleteResponse.affected) throw new Error("File not found");
	}

	async getFileById(fileId: number): Promise<DatabaseFile> {
		const file = await this.databaseRepository.findOne(fileId);
		if (!file) throw new Error("File not found");
		return file;
	}
}
