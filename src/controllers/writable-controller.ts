import { Orm } from "@lchemy/orm";
import Boom from "boom";

import { ApiRequest, ApiRequestParams } from "../models";
import { WritableService } from "../services";

import { ReadableController } from "./readable-controller";

export abstract class WritableController<M, O extends Orm, A = any> extends ReadableController<M, O, A> {
	constructor(protected service: WritableService<M, O, A>) {
		super(service);
	}

	async insert({ body, params, auth }: ApiRequest<A> = {}): Promise<{ data: object }> {
		const item = this.bodyToModel(body);
		await this.assertValidInsertParams(params != null ? params : {}, item);

		const model = await this.service.insert(() => {
			return { item, auth };
		});

		return {
			data: this.modelToJson(model)
		};
	}

	async update({ body, params, auth }: ApiRequest<A> = {}): Promise<{ data: object }> {
		if (params == null) {
			throw Boom.badRequest();
		}

		const item = this.bodyToModel(body);
		await this.assertValidUpdateParams(params, item);

		const model = await this.service.update(() => {
			return { item, auth };
		});

		return {
			data: this.modelToJson(model)
		};
	}

	async remove({ params, auth }: ApiRequest<A> = {}): Promise<{ success: boolean }> {
		if (params == null) {
			throw Boom.badRequest();
		}

		const item = this.removeParamsToModel(params);
		await this.assertValidRemoveParams(params);

		const success = await this.service.remove(() => {
			return { item, auth };
		});

		return { success };
	}

	protected bodyToModel(body?: object): M {
		if (body == null) {
			throw Boom.badRequest("Missing body payload");
		}

		try {
			return this.jsonToModel(body);
		} catch {
			throw Boom.badRequest("Invalid body paylod");
		}
	}

	protected updateParamsToModel(params: ApiRequestParams): M {
		return this.findOneParamsToModel(params);
	}

	protected removeParamsToModel(params: ApiRequestParams): M {
		return this.updateParamsToModel(params);
	}

	protected assertValidInsertParams(params: ApiRequestParams, _bodyModel: M): Promise<void> {
		return this.assertValidFindParams(params);
	}

	protected abstract checkUpdateParamsMatchesBody(bodyModel: M, paramModel: M): boolean;
	protected assertValidUpdateParams(params: ApiRequestParams, bodyModel: M): Promise<void> {
		const paramModel = this.updateParamsToModel(params),
			matches = this.checkUpdateParamsMatchesBody(bodyModel, paramModel);
		if (!matches) {
			throw Boom.badRequest("Request path does not match body payload");
		}

		return this.assertValidFindOneParams(params);
	}

	protected assertValidRemoveParams(params: ApiRequestParams): Promise<void> {
		return this.assertValidFindOneParams(params);
	}
}
