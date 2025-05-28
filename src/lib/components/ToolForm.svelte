<script lang="ts">
	import type { FormOptions, UiSchemaRoot } from '@sjsf/form';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing } from '$lib/types';
	import CapabilityForm from './CapabilityForm.svelte';
	import qrcode from 'qrcode-generator';
	import { logger } from '$lib/utils/logger';

	export let provider: { providerPubkey: string; serverId: string };
	export let tool: Tool;
	export let pricing: CapPricing | undefined = undefined;

	let uiSchema: UiSchemaRoot = {
		submitButton: {
			'ui:options': {
				title: 'Execute',
				button: {
					class:
						'w-fit px-4 py-2 bg-primary text-background rounded-md hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed'
				}
			}
		},
		'ui:globalOptions': {
			input: {
				class: 'bg-background/5'
			}
		}
	};
	const initialValue = {};

	// Handle form submission
	async function onSubmit(value: CallToolRequest['params']['arguments']) {
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

	$: toolExecutionStore = capabilityExecutor.getExecutionStore({
		method: 'tools/call',
		params: { name: tool.name, arguments: {} }
	});

	let qrCodeSvg = '';
	$: {
		if ($toolExecutionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($toolExecutionStore.paymentInfo.invoice);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 2 });
		}
	}
</script>

<CapabilityForm
	capabilityName={tool.name}
	capabilityType="tool"
	{pricing}
	schema={tool.inputSchema as FormOptions<string, string>['schema']}
	{uiSchema}
	{onSubmit}
	{initialValue}
>
	<div slot="payment-qr-code">
		<div class="flex justify-center rounded-md bg-white p-4 shadow-sm">
			{@html qrCodeSvg}
		</div>
	</div>

	<div slot="success-result">
		<div class="max-h-[800px] overflow-auto">
			<div class="w-full min-w-0">
				{#if Array.isArray($toolExecutionStore.result)}
					{#each $toolExecutionStore.result as result}
						<p
							class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
						>
							{result.type === 'text' ? result.text : JSON.stringify(result)}
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
	</div>
</CapabilityForm>
