import { A, D, F, flow, G } from "@mobily/ts-belt";
import type { EliminationFlag, Data } from "./types";
import * as ts from "typescript";

/**
 * @description it will be used in runtime for check the flag value.
 * @example
 * ```ts
 * // configuration
 * {
 *  USER_PROFILE_V1: () => true,
 * }
 *
 * // in user codebase
 * import { flag } from 'moduleFlagName'
 * const evaluation = flag.USER_PROFILE_V1("when On", "when Off")
 * ```
 * */
export const createFlagModule = flow(
	F.identity<Data>,
	D.getUnsafe("flagConfig"),
	D.map(
		F.ifElse(
			G.isFunction,
			(v) => v.toString(),
			(v) => (G.isString(v) ? v === "on" : v).toString(),
		),
	),
	D.toPairs,
);

export const transform = (
	code: string,
	id: string,
	flags: EliminationFlag[] = [],
) => {
	const source = ts.createSourceFile(
		id,
		code, // source code
		ts.ScriptTarget.Latest,
		true,
	);
	if (flags.length === 0) {
		return code;
	}

	// Function to collect all named imports from a specific module
	function getNamedImportsFromModule(
		sourceFile: ts.SourceFile,
		moduleName: string,
	): string[] {
		const namedImports: string[] = [];
		// Traverse the AST
		function findImports(node: ts.Node) {
			if (ts.isImportDeclaration(node)) {
				const importClause = node.importClause;
				const moduleSpecifier = node.moduleSpecifier
					.getText()
					.replace(/['"]/g, ""); // Remove quotes

				// Check if it's the module we're interested in
				if (
					moduleSpecifier === moduleName &&
					importClause?.namedBindings &&
					ts.isNamedImports(importClause.namedBindings)
				) {
					// Collect the named imports
					importClause.namedBindings.elements.forEach((element) => {
						// when use as import named.
						if (element.propertyName) {
							namedImports.push(element.propertyName.getText());
						} else {
							namedImports.push(element.name.getText());
						}
					});
				}
			}

			ts.forEachChild(node, findImports);
		}

		findImports(sourceFile);
		return namedImports;
	}
	function elimination(
		node: ts.SourceFile,
		namedImports: string[] = [],
	): ts.SourceFile {
		function visitor(node: ts.Node): ts.Node {
			if (ts.isCallExpression(node)) {
				const expression = node.expression;
				// Check if it's a property access expression like `flag.HOME_V1`
				if (
					ts.isPropertyAccessExpression(expression) &&
					node.arguments.length >= 1
				) {
					const objectName = expression.expression.getText(); // e.g. 'flag'
					const methodName = expression.name.getText(); // e.g. 'HOME_V1'
					if (namedImports.includes(objectName)) {
						const flagged = flags.find((flag) => flag.key === methodName);
						if (flagged) {
							const [truthy, falsy] = node.arguments;
							if (flagged.value) {
								return truthy;
							}
							return falsy || ts.factory.createNull();
						}
					}
				}
			}
			// Continue visiting all child nodes
			return ts.visitEachChild(node, visitor, undefined);
		}
		return ts.visitNode(node, visitor);
	}

	const namedImports = getNamedImportsFromModule(source, "@flag");

	// Update the AST by replacing nodes
	const updatedSourceFile = elimination(source, namedImports);

	// Print the updated code
	const printer = ts.createPrinter();
	return printer.printFile(updatedSourceFile);
};
