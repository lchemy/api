export class ApiResponse<T = any> {
	get statusCode(): number {
		return this._statusCode;
	}

	get contentType(): string {
		return this._contentType;
	}

	get headers(): Readonly<Record<string, string>> {
		return this._headers;
	}

	private _statusCode: number = 200;
	private _contentType: string = "application/json";
	private _headers: Record<string, string> = {};

	constructor(readonly value: T) {
	}

	code(statusCode: number): this {
		this._statusCode = statusCode;
		return this;
	}

	type(contentType: string): this {
		this._contentType = contentType;
		return this;
	}

	header(name: string, value: string): this {
		this._headers[name] = value;
		return this;
	}
}
