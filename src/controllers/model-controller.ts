import { Orm } from "@lchemy/orm";

import { ModelService } from "../services";

import { Controller } from "./controller";

export abstract class ModelController<M extends object, O extends Orm, A = any> extends Controller<A> {
	constructor(protected service: ModelService<M, O>) {
		super();
	}

	protected modelToJson(model: M): object {
		return model as any;
	}

	protected jsonToModel(json: object): M {
		return json as any;
	}

	protected modelsToJsons(models: M[]): object[] {
		return models.map((model) => this.modelToJson(model));
	}
	protected jsonsToModels(jsons: object[]): M[] {
		return jsons.map((json) => this.jsonToModel(json));
	}
}
