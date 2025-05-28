<script lang="ts">
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { theme } from '@sjsf/shadcn-theme';
	import type { FormOptions, UiSchemaRoot } from '@sjsf/form';
	import { onDestroy } from 'svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import type { JSONSchema7 } from 'json-schema';
	import { copyToClipboard } from '$lib/utils';
	import qrcode from 'qrcode-generator';
	import { validator } from '../../routes/s/[identifier]/_validator';
	import Spinner from './spinner.svelte';
	import { filterOptionalParameters } from '$lib/utils/commons';
	import type { CapPricing } from '$lib/types';

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

	const executionStore = capabilityExecutor.getExecutionStore(tool.name, 'tool');

	$: copyInvoice = () => {
		if ($executionStore.paymentInfo?.invoice) {
			copyToClipboard($executionStore.paymentInfo.invoice);
		}
	};

	let qrCodeSvg = '';
	$: {
		if ($executionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($executionStore.paymentInfo.invoice);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 2 });
		}
	}

	// Handle form submission
	async function onSubmit(value: CallToolRequest['params']['arguments']) {
		try {
			console.log('Executing prompt:', tool.name, 'with arguments:', value);
			await capabilityExecutor.executeTool(
				tool,
				value || {},
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			console.error('Prompt execution failed:', error);
		}
	}

	$: formattedOutput = (formValue: Record<string, unknown> | undefined) => {
		const filteredParams = filterOptionalParameters(formValue, tool.inputSchema as JSONSchema7);
		return JSON.stringify({
			name: tool.name,
			arguments: filteredParams
		});
	};

	onDestroy(() => {
		capabilityExecutor.resetExecutionState(tool.name, 'tool');
	});
</script>

<div class="space-y-4">
	{#if pricing && pricing.price && pricing.unit}
		<div class="mb-2 flex items-center gap-2">
			<span
				class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm dark:bg-primary dark:text-primary-foreground"
			>
				Price: {pricing.price}
				{pricing.unit}
			</span>
		</div>
	{/if}

	{#key tool.inputSchema}
		{@const createdForm = createForm3({
			...theme,
			initialValue,
			schema: tool.inputSchema as FormOptions<string, string>['schema'],
			uiSchema,
			validator,
			translation,
			onSubmit
		})}
		{#if createdForm}
			<div class="space-y-4">
				{#if $executionStore.status === 'payment-required' && $executionStore.paymentInfo}
					<Alert.Root
						class="border-amber-500/40 bg-amber-500/15 shadow-md dark:border-amber-400/30 dark:bg-amber-900/30"
					>
						<Alert.Title class="font-semibold text-amber-700 dark:text-amber-300"
							>Payment Required</Alert.Title
						>
						<Alert.Description class="text-amber-600 dark:text-amber-200">
							This tool requires a payment of {$executionStore.paymentInfo.amount}
							{$executionStore.paymentInfo.unit} to execute.
						</Alert.Description>
						<div class="mt-4 space-y-2">
							<div
								class="rounded-lg border border-amber-500/40 bg-background p-3 shadow-sm dark:border-amber-400/30 dark:bg-background/80"
							>
								<div class="mb-2 flex items-center justify-between">
									<span class="text-sm font-medium text-amber-700 dark:text-amber-300">QR Code</span
									>
									<button
										class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-amber-500/40 bg-background px-3 text-sm font-medium text-amber-700 shadow-sm ring-offset-background transition-colors hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-amber-400/30 dark:text-amber-300 dark:hover:bg-amber-900/20"
										on:click={copyInvoice}
									>
										Copy Invoice
									</button>
								</div>
								<div class="flex justify-center rounded-md bg-white p-4 shadow-sm">
									{@html qrCodeSvg}
								</div>
							</div>

							<p class="text-sm text-amber-600 dark:text-amber-200">
								Pay the invoice using a Lightning wallet. The tool will automatically execute once
								payment is confirmed.
							</p>
						</div>
					</Alert.Root>
				{:else}
					<RawForm form={createdForm} class="dark flex flex-col gap-4" />
					{#if $executionStore.status === 'loading'}
						<Alert.Root class="flex flex-col gap-2 border-blue-500/30 bg-blue-500/10">
							<div class="flex items-center gap-2">
								<Spinner size={4} borderThickness={4} />
								<Alert.Title class="m-0 text-blue-400">Executing Tool</Alert.Title>
							</div>
							<Alert.Description class="text-blue-300">
								Please wait while the tool is being executed. This may take a few moments...
							</Alert.Description>
						</Alert.Root>
					{/if}
					<div class="rounded-lg border border-primary/20 bg-background p-4">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm text-primary">Form Values</span>
							<button
								class="text-sm text-primary hover:text-primary/80"
								on:click={() => {
									copyToClipboard(formattedOutput(createdForm.value));
								}}
							>
								Copy
							</button>
						</div>
						<pre class="overflow-auto font-mono text-sm text-primary">{formattedOutput(
								createdForm.value
							)}</pre>
					</div>
				{/if}
			</div>
		{/if}
	{/key}

	{#if $executionStore.status === 'success'}
		<Alert.Root
			class="mt-4 border-green-500/40 bg-green-500/15 shadow-md dark:border-green-400/30 dark:bg-green-900/30"
		>
			<Alert.Title class="font-semibold text-green-700 dark:text-green-300">Success</Alert.Title>
			<Alert.Description class="text-green-600 dark:text-green-200">
				The tool executed successfully. View the results below.
			</Alert.Description>
			<div
				class="mt-4 rounded-lg border border-green-500/40 bg-background p-4 shadow-sm dark:border-green-400/30 dark:bg-background/80"
			>
				<div class="mb-2">
					<Tabs.Root value="result">
						<Tabs.List>
							<Tabs.Trigger
								value="result"
								class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
								>Tool Result</Tabs.Trigger
							>
							<Tabs.Trigger
								value="raw"
								class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
								>Raw</Tabs.Trigger
							>
						</Tabs.List>
						<Tabs.Content value="result">
							<div class="space-y-2">
								<div class="flex justify-end">
									<button
										class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
										on:click={() => {
											// Handle different possible result formats
											const result = $executionStore.result;
											let textToCopy = '';

											if (Array.isArray(result) && result.length > 0) {
												// Format: [{type: 'text', text: '...'}]
												if (result[0].text) {
													textToCopy = result[0].text;
												} else {
													textToCopy = JSON.stringify(result[0]);
												}
											} else if (typeof result === 'string') {
												// Plain string result
												textToCopy = result;
											} else {
												// Fallback for other formats
												textToCopy = JSON.stringify(result);
											}

											copyToClipboard(textToCopy);
										}}
									>
										Copy Result
									</button>
								</div>
								<div class="max-h-[800px] overflow-auto">
									<div class="w-full min-w-0">
										{#if Array.isArray($executionStore.result)}
											{#each $executionStore.result as result}
												<p
													class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
												>
													{result.type === 'text' ? result.text : JSON.stringify(result)}
												</p>
											{/each}
										{:else if typeof $executionStore.result === 'string'}
											<p
												class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
											>
												{$executionStore.result}
											</p>
										{:else}
											<p
												class="whitespace-pre-wrap break-all text-xl font-bold text-green-700 dark:text-green-200"
											>
												{JSON.stringify($executionStore.result, null, 2)}
											</p>
										{/if}
									</div>
								</div>
							</div>
						</Tabs.Content>
						<Tabs.Content value="raw">
							<div class="flex justify-end">
								<button
									class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
									on:click={() => {
										copyToClipboard(JSON.stringify($executionStore.result, null, 2));
									}}
								>
									Copy Raw
								</button>
							</div>
							<pre
								class="mt-2 overflow-auto font-mono text-sm text-green-700/90 dark:text-green-200/90">{JSON.stringify(
									$executionStore.result,
									null,
									2
								)}</pre>
						</Tabs.Content>
					</Tabs.Root>
				</div>
			</div>
		</Alert.Root>
	{:else if $executionStore.status === 'error'}
		<Alert.Root
			class="mt-4 border-red-500/40 bg-red-500/15 shadow-md dark:border-red-400/30 dark:bg-red-900/30"
		>
			<Alert.Title class="font-semibold text-red-700 dark:text-red-300">Error</Alert.Title>
			<Alert.Description class="text-red-600 dark:text-red-200">
				An error occurred while executing the tool.
			</Alert.Description>
			<div
				class="mt-2 rounded-lg border border-red-500/40 bg-background/20 p-3 shadow-sm dark:border-red-400/30 dark:bg-background/10"
			>
				<p class="font-mono text-sm text-red-700 dark:text-red-200">{$executionStore.error}</p>
			</div>
		</Alert.Root>
	{/if}
</div>
