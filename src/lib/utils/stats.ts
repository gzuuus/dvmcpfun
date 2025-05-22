import { fetchToolById } from '$lib/queries/tools';
import { toolExecutor } from '$lib/services/toolExecutor';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { statsServerId } from '../../routes/stats/constants'; // Adjust path as needed after file creation

/**
 * Executes a stats query using the predefined stats server ID.
 * Fetches the server and tool, then executes using toolExecutor.
 * Handles basic error reporting to the console.
 *
 * @param toolName The name of the specific stats tool to execute.
 * @param params The arguments for the tool execution.
 * @returns The fetched Tool object if successful, otherwise undefined.
 */
export async function executeStatQuery(
	toolName: string,
	params: Record<string, unknown>
): Promise<Tool | undefined> {
	try {
		const server = await fetchToolById(statsServerId);
		if (!server) {
			throw new Error(`Stats server '${statsServerId}' not found`);
		}

		const tool = server.tools.find((t) => t.name === toolName);
		if (!tool) {
			throw new Error(`Tool '${toolName}' not found on server '${statsServerId}'`);
		}

		await toolExecutor.executeTool(tool, params, server.event.pubkey);
		return tool; // Return the tool object which includes the description
	} catch (err) {
		console.error(`Error executing stats query for tool '${toolName}':`, err);
		// toolExecutor already updates the store with the error,
		// but we might want additional global error handling here later.
		return undefined; // Indicate failure
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
		console.error('Error parsing stats result:', error, 'Raw result:', result);
	}
	return defaultValue;
}
