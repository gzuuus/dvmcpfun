import { capabilityExecutor } from '$lib/services/capabilityExecutor';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const onSubmit = async (
	value: Record<string, unknown>,
	tool: Tool,
	providerPk: string,
	serverId?: string
) => {
	try {
		console.log('Executing tool:', tool.name, 'with arguments:', value);
		const result = await capabilityExecutor.executeTool(tool, value, providerPk, serverId);
		return result;
	} catch (error) {
		console.error('Tool execution failed:', error);
		return null;
	}
};
