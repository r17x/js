import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toTSType } from "./zodToTs";

describe("can be parsed zod.schema or z.ZodType to typescript type definition", () => {
	// TODO: fix this
	// ${"ZodNativeEnum value enum RGB { R, G, B }"} | ${z.nativeEnum(RGB)}    | ${"RGB"}
	// ${"ZodEnum"}                    | ${z.enum(["a", "b"])}   | ${'"a" | "b"'}
	it.each`
		n                               | a                       | b
		${"ZodString"}                  | ${z.string()}           | ${"string"}
		${"ZodNumber"}                  | ${z.number()}           | ${"number"}
		${"ZodBoolean"}                 | ${z.boolean()}          | ${"boolean"}
		${"ZodNull"}                    | ${z.null()}             | ${"null"}
		${"ZodUndefined"}               | ${z.undefined()}        | ${"undefined"}
		${"ZodAny"}                     | ${z.any()}              | ${"any"}
		${"ZodUnknown"}                 | ${z.unknown()}          | ${"unknown"}
		${"ZodVoid"}                    | ${z.void()}             | ${"void"}
		${"ZodNever"}                   | ${z.never()}            | ${"never"}
		${'ZodLiteral value "a"'}       | ${z.literal("a")}       | ${'"a"'}
		${"ZodLiteral value 1"}         | ${z.literal(1)}         | ${"1"}
		${"ZodLiteral value true"}      | ${z.literal(true)}      | ${"true"}
		${"ZodLiteral value false"}     | ${z.literal(false)}     | ${"false"}
		${"ZodLiteral value null"}      | ${z.literal(null)}      | ${"null"}
		${"ZodLiteral value undefined"} | ${z.literal(undefined)} | ${"undefined"}
		${"ZodLiteral value 1n"}        | ${z.literal(1n)}        | ${"1n"}
		${"ZodLiteral value -231n"}     | ${z.literal(-231n)}     | ${"-231n"}
	`("from zod $n is type $b ", ({ n: _, a, b }) => {
		expect(toTSType(a)).toBe(b);
	});
});
