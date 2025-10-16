import { SetMetadata } from "@nestjs/common";

export const Optional = () => SetMetadata("isOptional", true);
