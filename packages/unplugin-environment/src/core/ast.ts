// AST Helpers for generated typescript definition
// this module will be used fro generated /types/env.d.ts based on user schema.
import * as ts from "typescript";

const printer = ts.createPrinter({
	newLine: ts.NewLineKind.LineFeed,
	omitTrailingSemicolon: true,
});

const emptySourceFile = ts.createSourceFile("", "", ts.ScriptTarget.Latest);

export const printTypeDefinition = (node: ts.TypeNode) =>
	printer.printNode(ts.EmitHint.Unspecified, node, emptySourceFile);

export { SyntaxKind } from "typescript";
export { zodToTs } from "zod-to-ts";
