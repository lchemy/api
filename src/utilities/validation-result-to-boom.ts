import { ValidationResult } from "@lchemy/model/validation";
import Boom from "boom";

export function validationResultToBoom(result: ValidationResult): Boom {
	const err = Boom.badRequest();
	(err.output.payload as any).errors = result.errors;
	return err;
}
