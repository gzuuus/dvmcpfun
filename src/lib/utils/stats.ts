import type { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { statsServerId } from '../../routes/stats/constants';
import { fetchToolsListByServerId } from '$lib/queries/servers';
import { capabilityExecutor } from '$lib/services/capabilityExecutor';
import { logger } from '$lib/utils/logger';

/**
 * Executes a stats query using the predefined stats server ID.
 * Fetches the tool, then executes using capabilityExecutor.
 * Handles basic error reporting to the console.
 *
 * @param toolName The name of the specific stats tool to execute.
 * @param params The arguments for the tool execution.
 * @returns The fetched Tool object if successful, otherwise undefined.
 */
export async function executeStatQuery(
	toolName: string,
	params: CallToolRequest['params']['arguments']
): Promise<Tool | undefined> {
	try {
		const toolsList = await fetchToolsListByServerId(statsServerId);
		if (!toolsList) {
			throw new Error(`Stats server '${statsServerId}' not found`);
		}

		const tool = toolsList.tools.find((t) => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool '${toolName}' not found on server '${statsServerId}'`);
		}

		await capabilityExecutor.executeTool(
			tool,
			params,
			toolsList.providerPubkey || '',
			toolsList.serverId
		);
		return tool;
	} catch (err) {
		logger.error(
			`Error executing stats query for tool '${toolName}'`,
			err,
			'stats:executeStatQuery'
		);
		return undefined;
	}
}

/**
 * Parses the JSON result commonly returned by the stats tools.
 * Expects the result to be in the format [{ text: <JSON_string> }].
 *
 * @param result The raw result array from the toolExecutor store.
 * @param defaultValue The value to return if parsing fails or the result is empty/invalid. Defaults to an empty array.
 * @returns The parsed data as an array, or the defaultValue.
 */
export function parseStatResult<T>(result: any[] | null | undefined, defaultValue: T[] = []): T[] {
	try {
		if (result && result[0]?.text) {
			return JSON.parse(result[0].text) as T[];
		}
	} catch (error) {
		logger.error('Error parsing stats result', error, 'stats:parseStatResult');
	}
	return defaultValue;
}
