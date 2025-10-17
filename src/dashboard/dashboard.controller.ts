import { Controller, Get, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
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
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
		@Query()
		query: DashBoardDto,
	): Promise<DefaultResult<DashBoardResponse>> {
		return infinityPagination(
			HttpStatus.OK,
			await this.projectsService.getUserRating(query, page, limit),
			{ page, limit },
			{
				type: AlertType.success,
				title: "query data success",
				description: "query data success"
			},
		);
	}
}
