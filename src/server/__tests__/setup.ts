import container from "#server/facades/container.ts";
import HasherService from "#server/services/HasherService.ts";
import { EmmitterService } from "#shared/index.ts";

container.set(HasherService, new HasherService());
container.set(EmmitterService, new EmmitterService());
