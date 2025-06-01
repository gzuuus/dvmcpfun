import type { ErrorObject } from 'ajv';
import { createFormValidator } from '@sjsf/ajv8-validator';
import type { FormValueValidator } from '@sjsf/form';

export const validator = createFormValidator() satisfies FormValueValidator<ErrorObject>;
