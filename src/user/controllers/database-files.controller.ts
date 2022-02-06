import {
	Controller,
	Get,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Res,
	StreamableFile
} from "@nestjs/common";
import { Response } from "express";
import { Readable } from "stream";
import { DatabaseFile } from "../entities/databaseFile.entity";
import { DatabaseFilesService } from "../services/database-files.service";

@Controller("database-files")
export class DatabaseFilesController {
	constructor(private readonly databaseFilesService: DatabaseFilesService) {}

	@Get(":id")
	async getDatabaseFileById(
		@Param("id") id: string,
		@Res({ passthrough: true }) res: Response
	): Promise<StreamableFile> {
		let file: DatabaseFile;
		try {
			file = await this.databaseFilesService.getFileById(+id);
		} catch (error) {
			if (error.message == "File not found")
				throw new NotFoundException("File not found");
			else throw new InternalServerErrorException();
		}
		const stream = Readable.from(file.data);

		res.set({
			"Content-Disposition": `inline; filename="${file.fileName}"`,
			"Content-Type": "image"
		});

		return new StreamableFile(stream);
	}
}
