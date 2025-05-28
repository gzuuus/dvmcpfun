import { NDKEvent, type NDKSubscription } from '@nostr-dev-kit/ndk';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { generateSecretKey } from 'nostr-tools';
import { get, writable, type Writable } from 'svelte/store';
import ndkStore from '$lib/stores/nostr';
import type { Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';
import { setupNDKSigner } from '$lib/stores/login';
import type { JSONSchema7 } from 'json-schema';
import type { PaymentInfo } from '$lib/types';
import {
	NOTIFICATION_KIND,
	REQUEST_KIND,
	RESPONSE_KIND,
	TAG_METHOD,
	TAG_PUBKEY,
	TAG_SERVER_IDENTIFIER
} from '@dvmcp/commons/core';
import { filterOptionalParameters } from '$lib/utils/commons';
import { logger } from '$lib/utils/logger';

// Explicitly import request types for the new RequestType
import type {
	CallToolRequest,
	GetPromptRequest,
	ReadResourceRequest
} from '@modelcontextprotocol/sdk/types.js';

// Define a union type for all possible request payloads
type RequestType = CallToolRequest | GetPromptRequest | ReadResourceRequest;

// Define interface for capability key details
interface CapabilityDetails {
	capabilityName: string;
	capabilityType: CapabilityType;
}

// Helper function to centralize the logic for deriving capability key details
function getCapabilityKeyDetails(request: RequestType): CapabilityDetails {
	if (request.method === 'tools/call') {
		return { capabilityName: request.params.name, capabilityType: 'tool' };
	} else if (request.method === 'prompts/get') {
		return { capabilityName: request.params.name, capabilityType: 'prompt' };
	} else if (request.method === 'resources/read') {
		return { capabilityName: request.params.uri, capabilityType: 'resource' };
	}
	logger.error('Unknown request method', request, 'CapabilityExecutor:getCapabilityKeyDetails');
	throw new Error(`Unknown request method: ${JSON.stringify(request)}`); // Still throw to maintain existing flow
}

// Define capability types
export type CapabilityType = 'tool' | 'resource' | 'prompt';

// Define execution status
export type ExecutionStatus = 'idle' | 'loading' | 'success' | 'error' | 'payment-required';

// Define execution state interface
export interface CapabilityExecutionState {
	status: ExecutionStatus;
	result: any | null;
	error: string | null;
	capabilityName: string | null;
	capabilityType: CapabilityType;
	paymentInfo?: PaymentInfo;
}

export class CapabilityExecutor {
	private executionSubscriptions = new Map<string, NDKSubscription>();
	private executionStates = new Map<string, Writable<CapabilityExecutionState>>();
	private static readonly EXECUTION_TIMEOUT = 60 * 1000 * 5; // 5 minutes

	constructor() {}

	/**
	 * Get or create an execution store for a capability
	 */
	public getExecutionStore(request: RequestType): Writable<CapabilityExecutionState> {
		const { capabilityName, capabilityType } = getCapabilityKeyDetails(request);
		const storeKey = `${capabilityType}:${capabilityName}`;

		if (!this.executionStates.has(storeKey)) {
			this.executionStates.set(
				storeKey,
				writable({
					status: 'idle',
					result: null,
					error: null,
					capabilityName,
					capabilityType
				})
			);
		}

		return this.executionStates.get(storeKey)!;
	}

	/**
	 * Internal generic method to execute any capability with common state and error handling.
	 */
	private async _executeCapabilityInternal<T>(
		requestPayload: CallToolRequest | GetPromptRequest | ReadResourceRequest,
		providerPk: string,
		serverId?: string
	): Promise<T> {
		const { capabilityName, capabilityType } = getCapabilityKeyDetails(requestPayload);
		const executionStore = this.getExecutionStore(requestPayload);

		executionStore.update((state) => ({ ...state, status: 'loading', result: null, error: null }));

		try {
			const result = await this.executeCapability(requestPayload, providerPk, serverId);
			executionStore.update((state) => ({ ...state, status: 'success', result, error: null }));
			return result as T;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				`Error executing ${capabilityType} ${capabilityName}`,
				error,
				'CapabilityExecutor:_executeCapabilityInternal'
			);
			executionStore.update((state) => ({
				...state,
				status: 'error',
				result: null,
				error: errorMessage
			}));
			throw error;
		}
	}

	/**
	 * Execute a tool capability
	 */
	public async executeTool(
		tool: Tool,
		params: Record<string, unknown>,
		providerPk: string,
		serverId?: string
	): Promise<unknown> {
		const toolRequest: CallToolRequest = {
			method: 'tools/call',
			params: {
				name: tool.name,
				arguments: filterOptionalParameters(params, tool.inputSchema as JSONSchema7)
			}
		};
		return this._executeCapabilityInternal(toolRequest, providerPk, serverId);
	}

	/**
	 * Execute a resource capability (read a resource)
	 */
	public async executeResource(
		resource: Resource,
		providerPk: string,
		serverId?: string
	): Promise<unknown> {
		const resourceReadRequest: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: resource.uri
			}
		};
		return this._executeCapabilityInternal(resourceReadRequest, providerPk, serverId);
	}

	/**
	 * Execute a prompt capability (get a prompt)
	 */
	public async executePrompt(
		prompt: Prompt,
		args: Record<string, string>,
		providerPk: string,
		serverId?: string
	): Promise<unknown> {
		const promptGetRequest: GetPromptRequest = {
			method: 'prompts/get',
			params: {
				name: prompt.name,
				arguments: args
			}
		};
		return this._executeCapabilityInternal(promptGetRequest, providerPk, serverId);
	}

	/**
	 * Reset execution state for a capability
	 */
	public resetExecutionState(capabilityName: string, capabilityType: CapabilityType): void {
		const storeKey = `${capabilityType}:${capabilityName}`;
		const store = this.executionStates.get(storeKey);

		if (store) {
			store.update((state) => ({ ...state, status: 'idle', result: null, error: null }));
		}
	}

	/**
	 * Reset all execution states
	 */
	public resetAllExecutionStates(): void {
		this.executionStates.forEach((store) => {
			store.update((state) => ({ ...state, status: 'idle', result: null, error: null }));
		});
	}

	/**
	 * Generic method to execute any capability
	 */
	private async executeCapability(
		params: CallToolRequest | GetPromptRequest | ReadResourceRequest,
		providerPk: string,
		serverId?: string
	): Promise<unknown> {
		return new Promise(async (resolve, reject) => {
			try {
				// Create the request event first but don't publish it yet
				const requestEvent = await this.createCapabilityRequest(params, providerPk, serverId);
				const executionId = requestEvent.id;

				const timeoutId = setTimeout(() => {
					reject(
						new Error(
							`Capability execution timed out after ${CapabilityExecutor.EXECUTION_TIMEOUT}ms`
						)
					);
					this.cleanupExecution(executionId);
				}, CapabilityExecutor.EXECUTION_TIMEOUT);

				// Log the subscription filter for debugging
				logger.debug(
					'Subscribing to capability response with filter:',
					{
						kinds: [RESPONSE_KIND as number, NOTIFICATION_KIND],
						'#e': [executionId]
					},
					'CapabilityExecutor:executeCapability'
				);

				// Set up subscription BEFORE publishing the request
				const subscription = get(ndkStore).subscribe(
					[
						{
							kinds: [RESPONSE_KIND as number, NOTIFICATION_KIND],
							'#e': [executionId]
						}
					],
					{ closeOnEose: false }
				);

				subscription.on('event', async (event: NDKEvent) => {
					// Log the received event for debugging
					logger.debug(
						'Received event in capability executor:',
						{
							kind: event.kind,
							id: event.id,
							content: event.content.substring(0, 100) + (event.content.length > 100 ? '...' : '')
						},
						'CapabilityExecutor:executeCapability'
					);

					if (event.kind === RESPONSE_KIND) {
						try {
							const result = JSON.parse(event.content);
							logger.debug(
								'Parsed response result:',
								result,
								'CapabilityExecutor:executeCapability'
							);
							clearTimeout(timeoutId);
							this.cleanupExecution(executionId);

							// Handle the response format
							if (result) {
								if (result.content) {
									resolve(result.content);
								} else if (result.contents) {
									// For resources
									resolve(result.contents);
								} else if (result.messages) {
									// For prompts
									resolve(result.messages);
								} else {
									resolve(result); // Fallback to returning the entire result
								}
							} else {
								logger.warn(
									'Response has unexpected format',
									'CapabilityExecutor:executeCapability'
								);
								resolve(result); // Fallback to returning the entire result
							}
						} catch (error) {
							logger.error(
								'Error parsing response content',
								error,
								'CapabilityExecutor:executeCapability'
							);
							clearTimeout(timeoutId);
							this.cleanupExecution(executionId);
							reject(error instanceof Error ? error : new Error(String(error)));
						}
					} else if (event.kind === NOTIFICATION_KIND) {
						const statusTag = event.tags.find((t) => t[0] === 'status');
						if (!statusTag) return;

						const status = statusTag[1];

						if (status === 'error') {
							clearTimeout(timeoutId);
							this.cleanupExecution(executionId);
							reject(new Error(event.content));
						} else if (status === 'payment-required') {
							const amountTag = event.tags.find((t) => t[0] === 'amount');
							const invoiceTag = event.tags.find((t) => t[0] === 'invoice');
							const eventIdTag = event.tags.find((t) => t[0] === 'e');
							const pubkeyTag = event.tags.find((t) => t[0] === 'p');

							if (amountTag && invoiceTag && eventIdTag && pubkeyTag) {
								const paymentInfo: PaymentInfo = {
									amount: amountTag[1],
									unit: amountTag[2] || 'sats',
									invoice: invoiceTag[1],
									eventId: eventIdTag[1],
									pubkey: pubkeyTag[1]
								};
							}
						} else if (status === 'payment-accepted') {
						}
					}
				});

				this.executionSubscriptions.set(executionId, subscription);

				await new Promise<void>((resolve) =>
					subscription.on('eose', () => {
						resolve();
					})
				);

				logger.debug(
					'Publishing request event:',
					executionId,
					'CapabilityExecutor:executeCapability'
				);
				await requestEvent.publish();
				logger.debug(
					'Request published successfully',
					null,
					'CapabilityExecutor:executeCapability'
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Clean up all subscriptions
	 */
	public cleanup(): void {
		this.executionSubscriptions.forEach((subscription) => subscription.stop());
		this.executionSubscriptions.clear();
	}

	/**
	 * Clean up a specific execution subscription
	 */
	private cleanupExecution(executionId: string): void {
		const subscription = this.executionSubscriptions.get(executionId);
		if (subscription) {
			subscription.stop();
			this.executionSubscriptions.delete(executionId);
		}
	}

	/**
	 * Create a capability request event
	 */
	private async createCapabilityRequest(
		params: CallToolRequest | GetPromptRequest | ReadResourceRequest,
		provider: string,
		serverId?: string
	): Promise<NDKEvent> {
		const request = new NDKEvent(get(ndkStore));
		request.kind = REQUEST_KIND;

		request.content = JSON.stringify(params);

		request.tags.push([TAG_METHOD, params.method]);
		request.tags.push([TAG_PUBKEY, provider]);

		// Add server ID tag if provided
		if (serverId) {
			request.tags.push([TAG_SERVER_IDENTIFIER, serverId]);
		}

		if (!get(ndkStore).signer) {
			await setupNDKSigner(new NDKPrivateKeySigner(generateSecretKey()));
		}
		await request.sign();

		return request;
	}
}

// Export a singleton instance
export const capabilityExecutor = new CapabilityExecutor();
