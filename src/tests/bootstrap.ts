import { container } from "@lchemy/di";

jest.setTimeout(1000);

beforeEach(() => {
	container.snapshot();
});

afterEach(() => {
	container.restore();
});
