<script lang="ts">
	import type { GetPromptRequest, Prompt } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing } from '$lib/types';
	import type { JSONSchema7 } from 'json-schema';
	import CapabilityForm from './CapabilityForm.svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import { logger } from '$lib/utils/logger';

	export let provider: { providerPubkey: string; serverId: string };
	export let prompt: Prompt;
	export let pricing: CapPricing | undefined = undefined;

	// Convert prompt arguments to JSONSchema7 format
	function convertArgumentsToSchema(
		promptArgs: GetPromptRequest['params']['arguments']
	): JSONSchema7 {
		if (!promptArgs || !Array.isArray(promptArgs)) {
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

	const schema = convertArgumentsToSchema(
		prompt.arguments as GetPromptRequest['params']['arguments']
	);

	async function onSubmit(value: GetPromptRequest['params']['arguments']) {
		try {
			logger.info(
				`Executing prompt: ${prompt.name} with arguments: ${JSON.stringify(value)}`,
				'PromptForm:onSubmit'
			);
			await capabilityExecutor.executePrompt(
				prompt,
				value || {},
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			logger.error('Prompt execution failed', error, 'PromptForm:onSubmit');
		}
	}

	// Create a dummy RequestType to get the store
	import type { GetPromptRequest as PromptFormGetPromptRequest } from '@modelcontextprotocol/sdk/types.js';

	function createPromptRequest(name: string): PromptFormGetPromptRequest {
		return { method: 'prompts/get', params: { name, arguments: {} } };
	}

	// Get the execution store for this specific prompt
	$: promptExecutionStore = capabilityExecutor.getExecutionStore(createPromptRequest(prompt.name));
</script>

<CapabilityForm capabilityName={prompt.name} capabilityType="prompt" {pricing} {schema} {onSubmit}>
	<div slot="success-result">
		{#if $promptExecutionStore.result}
			{#if Array.isArray($promptExecutionStore.result)}
				<div class="space-y-4">
					{#each $promptExecutionStore.result as message}
						<div class="rounded-lg border border-green-500/20 p-3">
							<div class="mb-2 font-medium text-green-700 dark:text-green-300">
								{message.role === 'user' ? 'User' : 'Assistant'}:
							</div>
							{#if message.content?.type === 'text'}
								<div class="whitespace-pre-wrap text-green-700 dark:text-green-300">
									{message.content.text}
								</div>
							{:else if message.content?.type === 'image'}
								<div>
									<img
										src={`data:${message.content.mimeType};base64,${message.content.data}`}
										alt=""
										class="max-h-96 rounded-md"
									/>
								</div>
							{:else if message.content?.type === 'resource' && message.content.resource?.text}
								<div class="whitespace-pre-wrap text-green-700 dark:text-green-300">
									{message.content.resource.text}
								</div>
							{:else}
								<pre class="whitespace-pre-wrap text-sm text-green-700 dark:text-green-300">
									{JSON.stringify(message.content, null, 2)}
								</pre>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<pre class="whitespace-pre-wrap text-sm text-green-700 dark:text-green-300">
					{JSON.stringify($promptExecutionStore.result, null, 2)}
				</pre>
			{/if}
		{/if}
	</div>
</CapabilityForm>
