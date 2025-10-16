import { Controller, Get, HttpCode, HttpStatus, Query, Body, Param, Post } from "@nestjs/common";
import { DashBoardService } from "./dashboard.service";
import { Public } from "../common/decorators";
import { AlertType, DefaultResult } from "../common/types";
import { infinityPagination } from "../common/transforms";
import { DashBoardDto } from "./dtos";
import { DashBoardResponse } from "./types";

@Controller({
	path: "dashboard",
	version: "1",
})
export class DashBoardController {
	constructor(private readonly projectsService: DashBoardService) {}

	@Public()
	@Get("")
	@HttpCode(HttpStatus.OK)
	async findAll(
		@Query()
		query: DashBoardDto,
	): Promise<DefaultResult<DashBoardResponse>> {
		const page = query?.page ?? 1;
		let limit = query?.limit ?? 10;
		return infinityPagination(
			HttpStatus.OK,
			await this.projectsService.getUserRating(query),
			{ page, limit },
			{
				type: AlertType.success,
				title: "query data success",
				description: "query data success"
			},
		);
	}
}
