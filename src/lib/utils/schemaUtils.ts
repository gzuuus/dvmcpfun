import type { JSONSchema7 } from 'json-schema';
import type { GetPromptRequest } from '@modelcontextprotocol/sdk/types.js';

/**
 * Creates a JSON Schema from prompt arguments
 */
export function createSchemaFromPromptArgs(
	promptArgs?: GetPromptRequest['params']['arguments']
): JSONSchema7 {
	if (!promptArgs || !Array.isArray(promptArgs) || promptArgs.length === 0) {
		return {
			type: 'object',
			properties: {},
			required: []
		};
	}

	const properties: Record<string, any> = {};
	const required: string[] = [];

	promptArgs.forEach((arg) => {
		if (arg.name) {
			properties[arg.name] = {
				type: 'string',
				title: arg.name,
				description: arg.description || ''
			};

			if (arg.required) {
				required.push(arg.name);
			}
		}
	});

	return {
		type: 'object',
		properties,
		required: required.length > 0 ? required : undefined
	};
}

/**
 * Extracts parameters from a URI template and creates a JSON Schema
 */
export function createSchemaFromUriTemplate(uriTemplate: string): {
	schema: JSONSchema7;
	parameters: string[];
} {
	const paramRegex = /{([^}]+)}/g;
	const parameters: string[] = [];
	let match;

	while ((match = paramRegex.exec(uriTemplate)) !== null) {
		parameters.push(match[1]);
	}

	if (parameters.length === 0) {
		return {
			parameters,
			schema: {
				type: 'object',
				properties: {},
				required: []
			}
		};
	}

	const properties: Record<string, any> = {};
	parameters.forEach((param) => {
		properties[param] = {
			type: 'string',
			title: param,
			description: `Parameter: ${param}`
		};
	});

	return {
		parameters,
		schema: {
			type: 'object',
			properties,
			required: parameters
		}
	};
}

/**
 * Populates a URI template with values
 */
export function populateUriTemplate(template: string, values: Record<string, string>): string {
	let result = template;
	Object.entries(values).forEach(([key, value]) => {
		result = result.replace(`{${key}}`, encodeURIComponent(value));
	});
	return result;
}
