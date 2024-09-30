import { SyntaxKind, factory } from "typescript";
import { z } from "zod";
import { printTypeDefinition } from "./ast";

const primitives = {
	// string | number | symbol | bigint | boolean | null | undefined
	string: z.instanceof(z.ZodString),
	number: z.instanceof(z.ZodNumber),
	symbol: z.instanceof(z.ZodSymbol),
	bigint: z.instanceof(z.ZodBigInt),
	boolean: z.instanceof(z.ZodBoolean),
	null: z.instanceof(z.ZodNull),
	undefined: z.instanceof(z.ZodUndefined),

	// typescript keyword
	any: z.instanceof(z.ZodAny),
	unknown: z.instanceof(z.ZodUnknown),
	void: z.instanceof(z.ZodVoid),
	never: z.instanceof(z.ZodNever),
};

const _primitivesTSType = {
	string: SyntaxKind.StringKeyword,
	number: SyntaxKind.NumberKeyword,
	boolean: SyntaxKind.BooleanKeyword,
	null: SyntaxKind.NullKeyword,
	undefined: SyntaxKind.UndefinedKeyword,
	any: SyntaxKind.AnyKeyword,
	unknown: SyntaxKind.UnknownKeyword,
	void: SyntaxKind.VoidKeyword,
	never: SyntaxKind.NeverKeyword,
};

const stringLiteral = z
	.string()
	.transform((a) => factory.createStringLiteral(a));

const literalValue = z.union([
	stringLiteral,
	z.number().transform((a) => factory.createNumericLiteral(a)),
	// TODO: don't know how to handle this
	// z.symbol().transform(a => factory.createS),
	z
		.bigint()
		.transform((a) =>
			factory.createBigIntLiteral({
				negative: a.toString().startsWith("-"),
				base10Value: a.toString().replace("-", ""),
			}),
		),
	z
		.boolean()
		.transform((a) => (a ? factory.createTrue() : factory.createFalse())),
	z.null().transform(() => factory.createNull()),
	z
		.undefined()
		.transform(() =>
			factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword),
		),
]);

const literals = z
	.instanceof(z.ZodLiteral)
	.transform((v) => v.value)
	.pipe(
		z.union([
			z.string(),
			z.number(),
			z.symbol(),
			z.bigint(),
			z.boolean(),
			z.null(),
			z.undefined(),
		]),
	);

const zodEnumValue = (a: string[]) =>
	factory.createUnionTypeNode(
		a.map((b) => factory.createLiteralTypeNode(stringLiteral.parse(b))),
	);

const zodEnum = z
	.instanceof(z.ZodEnum)
	.transform((v) => v.options)
	.pipe(z.string().min(1).array());

const primitivesTransform = {
	string: factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
	number: factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
	boolean: factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
	null: factory.createKeywordTypeNode(SyntaxKind.NullKeyword),
	undefined: factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword),
	any: factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
	unknown: factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
	void: factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
	never: factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
};

const p = primitives.string
	.transform(() => primitivesTransform.string)
	.or(primitives.number.transform(() => primitivesTransform.number))
	.or(primitives.boolean.transform(() => primitivesTransform.boolean))
	.or(primitives.null.transform(() => primitivesTransform.null))
	.or(primitives.undefined.transform(() => primitivesTransform.undefined))
	.or(primitives.any.transform(() => primitivesTransform.any))
	.or(primitives.unknown.transform(() => primitivesTransform.unknown))
	.or(primitives.void.transform(() => primitivesTransform.void))
	.or(primitives.never.transform(() => primitivesTransform.never))
	.or(literals.transform((a) => literalValue.parse(a)))
	.or(zodEnum.transform((a) => zodEnumValue(a)));

export const toTSType = p.transform((a) => printTypeDefinition(a)).parse;
