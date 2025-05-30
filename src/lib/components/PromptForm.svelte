<script lang="ts">
	import type { GetPromptRequest, Prompt } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing, ProviderServerMeta } from '$lib/types';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import { logger } from '$lib/utils/logger';
	import qrcode from 'qrcode-generator';
	import { createSchemaFromPromptArgs } from '$lib/utils/schemaUtils';
	import CapabilityForm from './CapabilityForm.svelte';

	let {
		provider,
		prompt,
		pricing = undefined
	}: {
		provider: ProviderServerMeta;
		prompt: Prompt;
		pricing?: CapPricing;
	} = $props();

	const schema = createSchemaFromPromptArgs(
		prompt.arguments as GetPromptRequest['params']['arguments']
	);

	async function onSubmit(value: GetPromptRequest['params']['arguments']) {
		if (!provider.providerPubkey || !provider.serverId) {
			logger.error('Provider pubkey or server ID not found', 'PromptForm:onSubmit');
			return;
		}
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
	const promptExecutionStore = $derived(
		capabilityExecutor.getExecutionStore(createPromptRequest(prompt.name))
	);

	// Generate QR code for payment invoice
	let qrCodeSvg = $state('');
	$effect(() => {
		if ($promptExecutionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($promptExecutionStore.paymentInfo.invoice);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 2 });
		}
	});
</script>

{#snippet paymentQrCode()}
	<div class="flex justify-center rounded-md bg-white p-4 shadow-sm">
		{@html qrCodeSvg}
	</div>
{/snippet}
{#snippet successResult()}
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
{/snippet}

<CapabilityForm
	capabilityName={prompt.name}
	capabilityType="prompt"
	{pricing}
	{schema}
	uiSchema={{
		submitButton: {
			'ui:options': {
				title: 'Execute'
			}
		},
		'ui:globalOptions': {}
	}}
	{onSubmit}
	initialValue={{}}
	payment-qr-code={paymentQrCode}
	form-content={undefined}
	success-result={successResult}
/>
