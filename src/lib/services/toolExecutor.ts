import { NDKEvent, type NDKSubscription } from '@nostr-dev-kit/ndk';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { generateSecretKey } from 'nostr-tools';
import { get, writable, type Writable } from 'svelte/store';
import { DVM_NOTICE_KIND, TOOL_REQUEST_KIND, TOOL_RESPONSE_KIND } from '$lib/constants';
import ndkStore from '$lib/stores/nostr';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { setupNDKSigner } from '$lib/stores/login';
import { filterOptionalParameters } from '$lib/utils/tools';
import type { JSONSchema7 } from 'json-schema';
import type { PaymentInfo } from '$lib/types';
import { getCachedToolExecution, setCachedToolExecution } from '$lib/queries/tools';

export type ExecutionStatus = 'idle' | 'loading' | 'success' | 'error' | 'payment-required';

export interface ToolExecutionState {
	status: ExecutionStatus;
	result: any | null;
	error: string | null;
	toolName: string | null;
	paymentInfo?: PaymentInfo;
}

export class ToolExecutor {
	private executionSubscriptions = new Map<string, NDKSubscription>();
	private executionStates = new Map<string, Writable<ToolExecutionState>>();
	private static readonly EXECUTION_TIMEOUT = 60 * 1000 * 5;

	constructor() {}

	public getExecutionStore(toolName: string): Writable<ToolExecutionState> {
		if (!this.executionStates.has(toolName)) {
			this.executionStates.set(
				toolName,
				writable({
					status: 'idle',
					result: null,
					error: null,
					toolName
				})
			);
		}

		return this.executionStates.get(toolName)!;
	}

	public async executeTool(
		tool: Tool,
		params: Record<string, unknown>,
		providerPk: string
	): Promise<unknown> {
		const executionStore = this.getExecutionStore(tool.name);

		const cachedResult = getCachedToolExecution(tool, params, providerPk);
		if (cachedResult !== undefined) {
			console.log(`Using cached result for tool ${tool.name}`);
			executionStore.update((state) => ({
				...state,
				status: 'success',
				result: cachedResult,
				error: null
			}));
			return cachedResult;
		}

		executionStore.update((state) => ({ ...state, status: 'loading', result: null, error: null }));

		try {
			const result = await this.executeToolInternal(tool, params, providerPk);

			// Update the execution store with the result
			executionStore.update((state) => ({ ...state, status: 'success', result, error: null }));

			// Cache the result for future use
			setCachedToolExecution(tool, params, providerPk, result);

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`Error executing tool ${tool.name}:`, errorMessage);
			executionStore.update((state) => ({
				...state,
				status: 'error',
				result: null,
				error: errorMessage
			}));
			throw error;
		}
	}

	public resetExecutionState(toolName: string): void {
		const store = this.getExecutionStore(toolName);
		store.update((state) => ({ ...state, status: 'idle', result: null, error: null }));
	}

	public resetAllExecutionStates(): void {
		this.executionStates.forEach((_, toolName) => this.resetExecutionState(toolName));
	}

	private async executeToolInternal(
		tool: Tool,
		params: Record<string, unknown>,
		providerPk: string
	): Promise<unknown> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestEvent = await this.createToolRequest(tool, params, providerPk);
				const executionId = requestEvent.id;
				const executionStore = this.getExecutionStore(tool.name);

				const timeoutId = setTimeout(() => {
					reject(new Error(`Tool execution timed out after ${ToolExecutor.EXECUTION_TIMEOUT}ms`));
					this.cleanupExecution(executionId);
				}, ToolExecutor.EXECUTION_TIMEOUT);

				const subscription = get(ndkStore).subscribe(
					[
						{
							kinds: [TOOL_RESPONSE_KIND, DVM_NOTICE_KIND],
							since: Math.floor(Date.now() / 1000),
							'#e': [executionId]
						}
					],
					{ closeOnEose: false }
				);

				subscription.on('event', async (event: NDKEvent) => {
					if (event.kind === TOOL_RESPONSE_KIND) {
						try {
							const result = JSON.parse(event.content);
							clearTimeout(timeoutId);
							this.cleanupExecution(executionId);
							resolve(result.content);
						} catch (error) {
							clearTimeout(timeoutId);
							this.cleanupExecution(executionId);
							reject(error instanceof Error ? error : new Error(String(error)));
						}
					} else if (event.kind === DVM_NOTICE_KIND) {
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

								executionStore.update((state) => ({
									...state,
									status: 'payment-required',
									paymentInfo
								}));
							}
						} else if (status === 'payment-accepted') {
							executionStore.update((state) => ({
								...state,
								status: 'loading',
								paymentInfo: undefined
							}));
						}
					}
				});

				this.executionSubscriptions.set(executionId, subscription);

				await requestEvent.publish();
			} catch (error) {
				reject(error);
			}
		});
	}

	public cleanup(): void {
		this.executionSubscriptions.forEach((subscription) => subscription.stop());
		this.executionSubscriptions.clear();
	}

	private cleanupExecution(executionId: string): void {
		const subscription = this.executionSubscriptions.get(executionId);
		if (subscription) {
			subscription.stop();
			this.executionSubscriptions.delete(executionId);
		}
	}

	private async createToolRequest(
		tool: Tool,
		params: Record<string, unknown>,
		provider: string
	): Promise<NDKEvent> {
		const request = new NDKEvent(get(ndkStore));
		request.kind = TOOL_REQUEST_KIND;

		const filteredParams = filterOptionalParameters(params, tool.inputSchema as JSONSchema7);
		request.content = JSON.stringify({
			name: tool.name,
			parameters: filteredParams
		});

		request.tags.push(['c', 'execute-tool']);
		request.tags.push(['p', provider]);

		if (!get(ndkStore).signer) {
			await setupNDKSigner(new NDKPrivateKeySigner(generateSecretKey()));
		}
		await request.sign();

		return request;
	}
}

export const toolExecutor = new ToolExecutor();
