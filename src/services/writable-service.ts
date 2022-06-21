import { ValidationResult, Validator } from "@lchemy/model/validation";
import { Orm } from "@lchemy/orm";
import Boom from "boom";
import { Transaction } from "knex";

import { WritableDao } from "../daos";
import { InsertOneRequestBuilder, RemoveOneRequestBuilder, UpdateOneRequestBuilder } from "../models";
import { validationResultToBoom } from "../utilities";

import { ReadableService } from "./readable-service";

export type ValidationFunctionResult<M> = ValidationResult<M> | undefined;
export type ValidationFunction<M, A> = (model: M, auth?: A | undefined, trx?: Transaction) => ValidationFunctionResult<M> | Promise<ValidationFunctionResult<M>>;

export abstract class WritableService<M extends object, O extends Orm, A = any> extends ReadableService<M, O, A> {
	protected validator?: Validator<M>;
	protected insertValidator?: Validator<M>;
	protected updateValidator?: Validator<M>;

	protected insertValidations: Array<ValidationFunction<M, A>> = [];
	protected updateValidations: Array<ValidationFunction<M, A>> = [];
	protected removeValidations: Array<ValidationFunction<M, A>> = [];

	constructor(protected dao: WritableDao<M, O, A>) {
		super(dao);
	}

	async insert(builder: InsertOneRequestBuilder<M, A>, trx?: Transaction): Promise<M> {
		const { item, auth } = builder();

		return this.withTransaction(async (tx) => {
			await this.assertValidInsert(item, auth, tx);

			const beforeInsert = await this.beforeInsert(item, auth, tx),
				targetItem = beforeInsert != null ? beforeInsert : item,
				newItem = await this.onInsert(targetItem, auth, tx),
				afterInsert = await this.afterInsert(newItem, item, auth, tx);
			return afterInsert != null ? afterInsert : newItem;
		}, trx);
	}

	async update(builder: UpdateOneRequestBuilder<M, A>, trx?: Transaction): Promise<M> {
		const { item, auth } = builder();

		return this.withTransaction(async (tx) => {
			await this.assertValidUpdate(item, auth, tx);

			const beforeUpdate = await this.beforeUpdate(item, auth, tx),
				targetItem = beforeUpdate != null ? beforeUpdate : item,
				newItem = await this.onUpdate(targetItem, auth, tx),
				afterUpdate = await this.afterUpdate(newItem, item, auth, tx);
			return afterUpdate != null ? afterUpdate : newItem;
		}, trx);
	}

	async remove(builder: RemoveOneRequestBuilder<M, A>, trx?: Transaction): Promise<boolean> {
		const { item, auth } = builder();

		return this.withTransaction(async (tx) => {
			await this.assertValidRemove(item, auth, tx);

			const existingItem = (await this.dao.findOneByPrimaryFields(() => {
				return { item, auth };
			}, tx))!;

			const beforeRemove = await this.beforeRemove(existingItem, auth, tx),
				targetItem = beforeRemove != null ? beforeRemove : existingItem,
				success = await this.onRemove(targetItem, auth, tx),
				afterRemove = await this.afterRemove(success, existingItem, auth, tx);
			return afterRemove != null ? afterRemove : success;
		}, trx);
	}

	async validateInsertModel(model: M): Promise<ValidationResult<M> | undefined> {
		if (this.validator == null && this.insertValidator == null) {
			return;
		}
		const validator = (this.insertValidator || this.validator)!;
		return validator.validate(model);
	}

	async validateUpdateModel(model: M): Promise<ValidationResult<M> | undefined> {
		if (this.validator == null && this.insertValidator == null && this.updateValidator == null) {
			return;
		}
		const validator = (this.updateValidator || this.insertValidator || this.validator)!;
		return validator.validate(model);
	}

	protected async assertValidInsert(item: M, auth?: A, trx?: Transaction): Promise<void> {
		// check that it passes all validations
		await this.assertValidations([
			this.validateInsertModel,
			...this.insertValidations
		], item, auth, trx);
	}

	protected async assertValidUpdate(item: M, auth?: A, trx?: Transaction): Promise<void> {
		// check that it exists
		await this.assertExists(item, auth, trx);

		// check that it passes all validations
		await this.assertValidations([
			this.validateUpdateModel,
			...this.updateValidations
		], item, auth, trx);
	}

	protected async assertValidRemove(item: M, auth?: A, trx?: Transaction): Promise<void> {
		// check that it exists
		await this.assertExists(item, auth, trx);

		// check that it passes all validations
		await this.assertValidations(this.removeValidations, item, auth, trx);
	}

	protected async assertExists(item: M, auth?: A, trx?: Transaction): Promise<void> {
		const exists = await this.dao.findExistsByPrimaryFields(() => {
			return { item, auth };
		}, trx);

		if (exists) {
			return;
		}

		throw Boom.notFound();
	}

	protected async assertValidations(fns: Array<ValidationFunction<M, A>>, model: M, auth?: A, trx?: Transaction): Promise<void> {
		let result = ValidationResult.VALID_RESULT;

		try {
			await fns.reduce(async (prev, fn) => {
				await prev;

				if (!result.isValid) {
					return prev;
				}

				const ownResult = await fn.call(this, model, auth, trx) as ValidationFunctionResult<M>;
				if (ownResult != null && !ownResult.isValid) {
					result = ownResult;
				}
			}, Promise.resolve());
		} catch (err) {
			throw Boom.badRequest("Failed validations", err);
		}

		if (!result.isValid) {
			throw validationResultToBoom(result);
		}
	}

	protected async beforeInsert(_item: M, _auth: A | undefined, _trx: Transaction): Promise<M | undefined | void> {
		return;
	}

	protected onInsert(item: M, auth: A | undefined, trx: Transaction): Promise<M> {
		return this.dao.insertOne(() => {
			return { item, auth };
		}, trx);
	}

	protected async afterInsert(_insertedItem: M, _targetItem: M, _auth: A | undefined, _trx: Transaction): Promise<M | undefined | void> {
		return;
	}

	protected async beforeUpdate(_item: M, _auth: A | undefined, _trx: Transaction): Promise<M | undefined | void> {
		return;
	}

	protected onUpdate(item: M, auth: A | undefined, trx: Transaction): Promise<M> {
		return this.dao.updateOne(() => {
			return { item, auth };
		}, trx);
	}

	protected async afterUpdate(_updatedItem: M, _targetItem: M, _auth: A | undefined, _trx: Transaction): Promise<M | undefined | void> {
		return;
	}

	protected async beforeRemove(_item: M, _auth: A | undefined, _trx: Transaction): Promise<M | undefined | void> {
		return;
	}

	protected onRemove(item: M, auth: A | undefined, trx: Transaction): Promise<boolean> {
		return this.dao.removeOne(() => {
			return { item, auth };
		}, trx);
	}

	protected async afterRemove(_success: boolean, _removedItem: M, _auth: A | undefined, _trx: Transaction): Promise<boolean | undefined | void> {
		return;
	}
}
