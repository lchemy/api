import { Orm } from "@lchemy/orm";
import { Transaction } from "knex";

import { ReadableDao } from "../daos";
import { FindAllRequestBuilder, FindAllWithCountRequestBuilder, FindCountRequestBuilder, FindExistsByPrimaryFieldsRequestBuilder, FindOneByPrimaryFieldsRequestBuilder } from "../models";

import { ModelService } from "./model-service";

export abstract class ReadableService<M, O extends Orm, A = any> extends ModelService<M, O> {
	constructor(protected dao: ReadableDao<M, O, A>) {
		super(dao);
	}

	find(builder: FindAllRequestBuilder<O, A>, trx?: Transaction): Promise<M[]> {
		return this.dao.findAll(builder, trx);
	}

	findWithCount(builder: FindAllWithCountRequestBuilder<O, A>, trx?: Transaction): Promise<{ count: number, rows: M[] }> {
		return this.dao.findAllWithCount(builder, trx);
	}

	findByPrimaryFields(builder: FindOneByPrimaryFieldsRequestBuilder<O, M, A>, trx?: Transaction): Promise<M | undefined> {
		return this.dao.findOneByPrimaryFields(builder, trx);
	}

	findExistsWithFilter(builder: FindCountRequestBuilder<O, A>, trx?: Transaction): Promise<boolean> {
		return this.dao.findExistsWithFilter(builder, trx);
	}

	findExistsByPrimaryFields(builder: FindExistsByPrimaryFieldsRequestBuilder<M, A>, trx?: Transaction): Promise<boolean> {
		return this.dao.findExistsByPrimaryFields(builder, trx);
	}
}
