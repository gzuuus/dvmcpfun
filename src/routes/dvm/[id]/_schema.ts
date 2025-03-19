import type { JSONSchema7 } from 'json-schema';
import type { UiSchema } from '@sjsf/form';

// The schema will be dynamically set based on the tool's parameters
export const schema: JSONSchema7 = {
	type: 'object',
	properties: {},
	required: []
};

export const uiSchema: UiSchema = {};

export const initialValue = {};
