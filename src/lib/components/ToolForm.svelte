<script lang="ts">
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing, ProviderServerMeta } from '$lib/types';
	import qrcode from 'qrcode-generator';
	import { logger } from '$lib/utils/logger';
	import CapabilityForm from './CapabilityForm.svelte';
	import type { JSONSchema7 } from 'json-schema';

	let {
		provider,
		tool,
		pricing = undefined
	}: {
		provider: ProviderServerMeta;
		tool: Tool;
		pricing?: CapPricing;
	} = $props();

	// Function to execute tool
	async function onSubmit(value: CallToolRequest['params']['arguments']) {
		if (!provider.providerPubkey || !provider.serverId) {
			logger.error('Provider pubkey or server ID not found', 'ToolForm:onSubmit');
			return;
		}
		try {
			logger.info(
				`Executing tool: ${tool.name} with arguments: ${JSON.stringify(value)}`,
				'ToolForm:onSubmit'
			);
			await capabilityExecutor.executeTool(
				tool,
				value || {},
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			logger.error('Tool execution failed', error, 'ToolForm:onSubmit');
		}
	}

	// Create a dummy RequestType to get the store
	const toolExecutionStore = $derived(
		capabilityExecutor.getExecutionStore({
			method: 'tools/call',
			params: { name: tool.name, arguments: {} }
		})
	);

	// Generate QR code for payment invoice
	let qrCodeSvg = $state('');
	$effect(() => {
		if ($toolExecutionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($toolExecutionStore.paymentInfo.invoice);
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
	<div class="max-h-[800px] overflow-auto">
		<div class="w-full min-w-0">
			{#if Array.isArray($toolExecutionStore.result)}
				{#each $toolExecutionStore.result as result}
					<p
						class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
					>
						{result.type === 'text' ? result.text : JSON.stringify(result, null, 2)}
					</p>
				{/each}
			{:else if typeof $toolExecutionStore.result === 'string'}
				<p
					class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
				>
					{$toolExecutionStore.result}
				</p>
			{:else}
				<p
					class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
				>
					{JSON.stringify($toolExecutionStore.result, null, 2)}
				</p>
			{/if}
		</div>
	</div>
{/snippet}

<CapabilityForm
	capabilityName={tool.name}
	capabilityType="tool"
	{pricing}
	schema={tool.inputSchema as JSONSchema7}
	uiSchema={{
		submitButton: {
			'ui:options': {
				title: 'Execute'
			}
		},
		'ui:globalOptions': {
			// Specific uiSchema button/input properties were removed due to type incompatibility.
			// Styling handled via global CSS and shadcn components.
		}
	}}
	{onSubmit}
	initialValue={{}}
	payment-qr-code={paymentQrCode}
	form-content={undefined}
	success-result={successResult}
/>
