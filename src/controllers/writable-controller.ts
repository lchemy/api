import { Orm } from "@lchemy/orm";
import Boom from "boom";

import { ApiRequest } from "../models";
import { WritableService } from "../services";

import { ReadableController } from "./readable-controller";

export abstract class WritableController<M, O extends Orm, A = any> extends ReadableController<M, O, A> {
	constructor(protected service: WritableService<M, O, A>) {
		super(service);
	}

	async insert({ body, auth }: ApiRequest<A> = {}): Promise<{ data: object }> {
		const item = this.bodyToModel(body);

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

		const item = this.bodyToModel(body),
			paramItem = this.updateParamsToModel(params);

		const matches = this.checkParamsMatchesBody(item, paramItem);
		if (!matches) {
			throw Boom.badRequest("Request path does not match body payload");
		}

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

	protected updateParamsToModel(params: { [key: string]: string | undefined }): M {
		return this.findOneParamsToModel(params);
	}

	protected removeParamsToModel(params: { [key: string]: string | undefined }): M {
		return this.updateParamsToModel(params);
	}

	protected abstract checkParamsMatchesBody(bodyModel: M, paramModel: M): boolean;
}
