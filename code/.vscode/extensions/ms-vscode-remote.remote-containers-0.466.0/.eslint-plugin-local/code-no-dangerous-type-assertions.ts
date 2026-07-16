/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

import * as eslint from 'eslint';

export = new class NoDangerousTypeAssertions implements eslint.Rule.RuleModule {

	create(context: eslint.Rule.RuleContext): eslint.Rule.RuleListener {
		// Disable in tests for now
		if (context.filename.includes('.test')) {
			return {};
		}

		return {
			// Disallow type assertions on object literals: <T>{ ... } or {} as T
			['TSTypeAssertion > ObjectExpression, TSAsExpression > ObjectExpression']: (node: any) => {
				const parent = node.parent;
				if (
					// Allow `as const` assertions
					(parent.typeAnnotation.type === 'TSTypeReference' && parent.typeAnnotation.typeName.type === 'Identifier' && parent.typeAnnotation.typeName.name === 'const')

					// For also now still allow `any` casts
					|| (parent.typeAnnotation.type === 'TSAnyKeyword')
				) {
					return;
				}

				context.report({
					node,
					message: "Don't use type assertions for creating objects as this can hide type errors."
				});
			},
		};
	}
};
