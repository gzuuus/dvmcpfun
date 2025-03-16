import { toolExecutor } from '$lib/services/toolExecutor';
import type { Tool } from '$lib/types';

export const onSubmit = async (value: unknown, tool: Tool) => {
	try {
		console.log('Executing tool:', tool.name, 'with parameters:', value);
		const result = await toolExecutor.executeTool(tool, value);
		return result;
	} catch (error) {
		console.error('Tool execution failed:', error);
		return null;
	}
};
