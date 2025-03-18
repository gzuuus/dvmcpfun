import { toolExecutor } from '$lib/services/toolExecutor';
import type { Tool } from '$lib/types';

export const onSubmit = async (value: unknown, tool: Tool, providerPk: string) => {
	try {
		console.log('Executing tool:', tool.name, 'with parameters:', value);
		const result = await toolExecutor.executeTool(tool, value, providerPk);
		return result;
	} catch (error) {
		console.error('Tool execution failed:', error);
		return null;
	}
};
