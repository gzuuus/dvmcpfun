<script lang="ts">
	import { onDestroy } from 'svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { copyToClipboard } from '$lib/utils';
	import { logger } from '$lib/utils/logger';
	import Spinner from './spinner.svelte';
	import type { CapPricing, ProviderServerMeta } from '$lib/types';
	import type { JSONSchema7 } from 'json-schema';
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { theme } from '@sjsf/shadcn-theme';
	import { validator } from '../../routes/s/[identifier]/_validator';
	import type { UiSchemaRoot } from '@sjsf/form';
	import type {
		CallToolRequest,
		GetPromptRequest,
		ReadResourceRequest
	} from '@modelcontextprotocol/sdk/types.js';

	export let capabilityName: string;
	export let capabilityType: 'prompt' | 'resource' | 'tool';
	export let pricing: CapPricing | undefined = undefined;
	export let schema: JSONSchema7 | undefined = undefined;
	export let uiSchema: UiSchemaRoot = {
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
	export let onSubmit: ((value: any) => Promise<void>) | undefined = undefined;
	export let initialValue: any = {};

	function createRequestObject(
		name: string,
		type: 'prompt' | 'resource' | 'tool'
	): CallToolRequest | GetPromptRequest | ReadResourceRequest {
		if (type === 'prompt') {
			return { method: 'prompts/get', params: { name, arguments: {} } };
		} else if (type === 'resource') {
			return { method: 'resources/read', params: { uri: name } };
		} else if (type === 'tool') {
			return { method: 'tools/call', params: { name, arguments: {} } };
		}
		logger.error('Unknown capability type', { name, type }, 'CapabilityForm:createRequestObject');
		throw new Error('Unknown capability type'); // Still throw to maintain existing flow
	}

	const executionStore = capabilityExecutor.getExecutionStore(
		createRequestObject(capabilityName, capabilityType)
	);

	let createdForm: ReturnType<typeof createForm3> | undefined;

	$: {
		if (schema && onSubmit) {
			createdForm = createForm3({
				...theme,
				initialValue,
				schema,
				uiSchema,
				translation,
				validator,
				onSubmit
			});
		} else {
			createdForm = undefined;
		}
	}

	onDestroy(() => {
		// Use resetExecutionState directly, no need to create a dummy request
		capabilityExecutor.resetExecutionState(capabilityName, capabilityType);
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

	{#if $executionStore.status === 'payment-required' && $executionStore.paymentInfo}
		<Alert.Root
			class="border-amber-500/40 bg-amber-500/15 shadow-md dark:border-amber-400/30 dark:bg-amber-900/30"
		>
			<Alert.Title class="font-semibold text-amber-700 dark:text-amber-300"
				>Payment Required</Alert.Title
			>
			<Alert.Description class="text-amber-600 dark:text-amber-200">
				This {capabilityType} requires a payment of {$executionStore.paymentInfo.amount}
				{$executionStore.paymentInfo.unit} to execute.
			</Alert.Description>
			<div class="mt-4 space-y-2">
				<div
					class="rounded-lg border border-amber-500/40 bg-background p-3 shadow-sm dark:border-amber-400/30 dark:bg-background/80"
				>
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium text-amber-700 dark:text-amber-300">Invoice</span>
						<button
							class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-amber-500/40 bg-background px-3 text-sm font-medium text-amber-700 shadow-sm ring-offset-background transition-colors hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-amber-400/30 dark:text-amber-300 dark:hover:bg-amber-900/20"
							onclick={() => {
								if ($executionStore.paymentInfo?.invoice) {
									copyToClipboard($executionStore.paymentInfo.invoice);
								}
							}}
						>
							Copy Invoice
						</button>
					</div>
					<div class="rounded-md bg-background/80 p-2">
						{#if $$slots['payment-qr-code']}
							<slot name="payment-qr-code" />
						{:else}
							<pre class="overflow-auto text-xs text-amber-600 dark:text-amber-200">{$executionStore
									.paymentInfo.invoice}</pre>
						{/if}
					</div>
				</div>

				<p class="text-sm text-amber-600 dark:text-amber-200">
					Pay the invoice using a Lightning wallet. The {capabilityType} will automatically execute once
					payment is confirmed.
				</p>
			</div>
		</Alert.Root>
	{:else}
		{#if createdForm}
			<RawForm form={createdForm} class="dark flex flex-col gap-4" />
		{:else}
			<slot name="form-content" />
		{/if}

		{#if $executionStore.status === 'loading'}
			<Alert.Root class="flex flex-col gap-2 border-blue-500/30 bg-blue-500/10">
				<div class="flex items-center gap-2">
					<Spinner size={4} borderThickness={4} />
					<Alert.Title class="m-0 text-blue-400">Executing {capabilityType}</Alert.Title>
				</div>
				<Alert.Description class="text-blue-300">
					Please wait while the {capabilityType} is being executed. This may take a few moments...
				</Alert.Description>
			</Alert.Root>
		{/if}

		{#if createdForm}
			<div class="rounded-lg border border-primary/20 bg-background p-4">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm text-primary">Form Values</span>
					<button
						class="text-sm text-primary hover:text-primary/80"
						onclick={() => {
							copyToClipboard(JSON.stringify(createdForm?.value, null, 2));
						}}
					>
						Copy
					</button>
				</div>
				<pre class="overflow-auto font-mono text-sm text-primary">{JSON.stringify(
						createdForm?.value,
						null,
						2
					)}</pre>
			</div>
		{/if}
	{/if}

	{#if $executionStore.status === 'success'}
		<Alert.Root
			class="mt-4 border-green-500/40 bg-green-500/15 shadow-md dark:border-green-400/30 dark:bg-green-900/30"
		>
			<Alert.Title class="font-semibold text-green-700 dark:text-green-300">Success</Alert.Title>
			<Alert.Description class="text-green-600 dark:text-green-200">
				The {capabilityType} executed successfully. View the results below.
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
								>Result</Tabs.Trigger
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
										onclick={() => {
											if ($executionStore.result) {
												// A slot would also go here.
												const content = JSON.stringify($executionStore.result, null, 2);
												copyToClipboard(content);
											}
										}}
									>
										Copy Result
									</button>
								</div>
								{#if $$slots['success-result']}
									<slot name="success-result" />
								{:else}
									<pre
										class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
										{JSON.stringify($executionStore.result, null, 2)}
									</pre>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="raw">
							<div class="flex justify-end">
								<button
									class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
									onclick={() => {
										copyToClipboard(JSON.stringify($executionStore.result, null, 2));
									}}
								>
									Copy Raw
								</button>
							</div>
							<pre
								class="max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs text-green-700 dark:text-green-300">
								{JSON.stringify($executionStore.result, null, 2)}
							</pre>
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
				{#if $$slots['error-description']}
					<slot name="error-description" />
				{:else}
					{$executionStore.error || `An error occurred while executing the ${capabilityType}.`}
				{/if}
			</Alert.Description>
			{#if $executionStore.error && !$$slots['error-description']}
				<div
					class="mt-2 rounded-lg border border-red-500/40 bg-background/20 p-3 shadow-sm dark:border-red-400/30 dark:bg-background/10"
				>
					<p class="font-mono text-sm text-red-700 dark:text-red-200">{$executionStore.error}</p>
				</div>
			{/if}
		</Alert.Root>
	{/if}
</div>
