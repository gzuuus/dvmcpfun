<script lang="ts">
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { theme } from '@sjsf/shadcn-theme';
	import type { UiSchemaRoot } from '@sjsf/form';
	import { onDestroy } from 'svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { copyToClipboard } from '$lib/utils';
	import qrcode from 'qrcode-generator';
	import { validator } from '../../routes/s/[identifier]/_validator';
	import Spinner from './spinner.svelte';
	import type { CapPricing } from '$lib/types';
	import type { JSONSchema7 } from 'json-schema';

	export let provider: { providerPubkey: string; serverId: string };
	export let resourceTemplate: ResourceTemplate;
	export let pricing: CapPricing | undefined = undefined;

	// Extract parameters from URI template
	function extractParametersFromUriTemplate(uriTemplate: string): JSONSchema7 {
		const paramRegex = /{([^}]+)}/g;
		const matches = [...uriTemplate.matchAll(paramRegex)];

		const properties: Record<string, any> = {};
		const required: string[] = [];

		matches.forEach((match) => {
			const paramName = match[1];
			properties[paramName] = {
				type: 'string',
				title: paramName,
				description: `Parameter ${paramName} for the resource URI`
			};
			required.push(paramName);
		});

		return {
			type: 'object',
			properties,
			required: required.length > 0 ? required : undefined
		};
	}

	// Store the current resource name
	let currentResourceName = resourceTemplate.name;

	// Create schema and form configuration
	$: inputSchema = extractParametersFromUriTemplate(resourceTemplate.uriTemplate);
	$: executionStore = capabilityExecutor.getExecutionStore(currentResourceName, 'resource');

	// Form configuration
	const uiSchema: UiSchemaRoot = {
		submitButton: {
			'ui:options': {
				title: 'Get Resource',
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

	// Handle form submission
	async function onSubmit(value: Record<string, string>) {
		try {
			// Replace template parameters with actual values
			let uri = resourceTemplate.uriTemplate;
			Object.entries(value).forEach(([key, val]) => {
				uri = uri.replace(`{${key}}`, val);
			});

			// Create a resource from the template
			const resourceName = `${resourceTemplate.name} (${Object.values(value).join(', ')})`;
			const resource = {
				name: resourceName,
				uri,
				mimeType: resourceTemplate.mimeType
			};

			// Update tracking and execute
			currentResourceName = resourceName;
			await capabilityExecutor.executeResource(
				resource,
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			console.error('Resource template execution failed:', error);
		}
	}

	// Payment handling
	function copyInvoice() {
		if ($executionStore.paymentInfo?.invoice) {
			copyToClipboard($executionStore.paymentInfo.invoice);
		}
	}

	// Generate QR code for payment
	let qrCodeSvg = '';
	$: {
		if ($executionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($executionStore.paymentInfo.invoice);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 2 });
		} else {
			qrCodeSvg = '';
		}
	}

	// Helper for copying content
	function copyContent() {
		if (!$executionStore.result) return;

		const content = Array.isArray($executionStore.result)
			? $executionStore.result[0]?.text || JSON.stringify($executionStore.result, null, 2)
			: $executionStore.result.text || JSON.stringify($executionStore.result, null, 2);

		copyToClipboard(content);
	}

	// Clean up on component destruction
	onDestroy(() => {
		capabilityExecutor.resetExecutionState(resourceTemplate.name, 'resource');
		if (currentResourceName !== resourceTemplate.name) {
			capabilityExecutor.resetExecutionState(currentResourceName, 'resource');
		}
	});
</script>

<div class="space-y-4">
	<!-- Pricing information -->
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

	<!-- Template details -->
	<div class="rounded-lg border border-primary/20 bg-background p-4">
		<h3 class="mb-2 text-lg font-medium text-primary">Template Details</h3>
		<p class="mb-2 text-foreground">
			<span class="font-medium">URI Template:</span>
			{resourceTemplate.uriTemplate}
		</p>
		{#if resourceTemplate.mimeType}
			<p class="text-foreground">
				<span class="font-medium">MIME Type:</span>
				{resourceTemplate.mimeType}
			</p>
		{/if}
	</div>

	<!-- Form -->
	{#key resourceTemplate.uriTemplate}
		{@const createdForm = createForm3({
			...theme,
			translation,
			validator,
			schema: inputSchema,
			uiSchema,
			initialValue: {},
			onSubmit
		})}
		<RawForm form={createdForm} class="dark flex flex-col gap-4" />
	{/key}

	<!-- Loading state -->
	{#if $executionStore.status === 'loading'}
		<Alert.Root class="flex flex-col gap-2 border-blue-500/30 bg-blue-500/10">
			<div class="flex items-center gap-2">
				<Spinner size={4} borderThickness={4} />
				<Alert.Title class="m-0 text-blue-400">Loading Resource</Alert.Title>
			</div>
			<Alert.Description class="text-blue-300">
				Please wait while the resource is being loaded...
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Payment required state -->
	{#if $executionStore.status === 'payment-required' && $executionStore.paymentInfo}
		<Alert.Root
			class="border-amber-500/40 bg-amber-500/15 shadow-md dark:border-amber-400/30 dark:bg-amber-900/30"
		>
			<Alert.Title class="font-semibold text-amber-700 dark:text-amber-300"
				>Payment Required</Alert.Title
			>
			<Alert.Description class="text-amber-600 dark:text-amber-200">
				This resource requires a payment of {$executionStore.paymentInfo.amount}
				{$executionStore.paymentInfo.unit} to access.
			</Alert.Description>
			<div class="mt-4 space-y-2">
				<div
					class="rounded-lg border border-amber-500/40 bg-background p-3 shadow-sm dark:border-amber-400/30 dark:bg-background/80"
				>
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm font-medium text-amber-700 dark:text-amber-300">Invoice</span>
						<button
							class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-amber-500/40 bg-background px-3 text-sm font-medium text-amber-700 shadow-sm ring-offset-background transition-colors hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-amber-400/30 dark:text-amber-300 dark:hover:bg-amber-900/20"
							on:click={copyInvoice}
						>
							Copy Invoice
						</button>
					</div>
					<div class="rounded-md bg-background/80 p-2">
						<pre class="overflow-auto text-xs text-amber-600 dark:text-amber-200">{$executionStore
								.paymentInfo.invoice}</pre>
					</div>
				</div>

				<div class="flex justify-center py-2">
					{@html qrCodeSvg}
				</div>

				<p class="text-sm text-amber-600 dark:text-amber-200">
					Pay the invoice using a Lightning wallet. The resource will automatically be loaded once
					payment is confirmed.
				</p>
			</div>
		</Alert.Root>
	{/if}

	<!-- Success state -->
	{#if $executionStore.status === 'success'}
		<Alert.Root
			class="mt-4 border-green-500/40 bg-green-500/15 shadow-md dark:border-green-400/30 dark:bg-green-900/30"
		>
			<Alert.Title class="font-semibold text-green-700 dark:text-green-300">Success</Alert.Title>
			<Alert.Description class="text-green-600 dark:text-green-200">
				The resource was loaded successfully.
			</Alert.Description>
			<div
				class="mt-4 rounded-lg border border-green-500/40 bg-background p-4 shadow-sm dark:border-green-400/30 dark:bg-background/80"
			>
				<Tabs.Root value="content">
					<Tabs.List>
						<Tabs.Trigger
							value="content"
							class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
						>
							Content
						</Tabs.Trigger>
						<Tabs.Trigger
							value="raw"
							class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
						>
							Raw
						</Tabs.Trigger>
					</Tabs.List>

					<!-- Content Tab -->
					<Tabs.Content value="content">
						<div class="space-y-2">
							<div class="flex justify-end">
								<button
									class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
									on:click={copyContent}
								>
									Copy
								</button>
							</div>

							{#if $executionStore.result}
								{#if Array.isArray($executionStore.result)}
									{#each $executionStore.result as item}
										{#if item.text}
											<div
												class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300"
											>
												{item.text}
											</div>
										{:else if item.blob && item.mimeType?.startsWith('image/')}
											<div class="text-sm text-green-700 dark:text-green-300">
												<img
													src={`data:${item.mimeType};base64,${item.blob}`}
													alt="Resource content"
													class="mt-2 max-h-96 rounded-md"
												/>
											</div>
										{:else if item.blob}
											<div class="text-sm text-green-700 dark:text-green-300">
												<p>Binary data (base64 encoded)</p>
												<pre
													class="mt-2 max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs">{item.blob}</pre>
											</div>
										{:else}
											<pre
												class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
												{JSON.stringify(item, null, 2)}
											</pre>
										{/if}
									{/each}
								{:else if $executionStore.result.text}
									<div
										class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300"
									>
										{$executionStore.result.text}
									</div>
								{:else if $executionStore.result.blob && $executionStore.result.mimeType?.startsWith('image/')}
									<div class="text-sm text-green-700 dark:text-green-300">
										<img
											src={`data:${$executionStore.result.mimeType};base64,${$executionStore.result.blob}`}
											alt="Resource content"
											class="mt-2 max-h-96 rounded-md"
										/>
									</div>
								{:else if $executionStore.result.blob}
									<div class="text-sm text-green-700 dark:text-green-300">
										<p>Binary data (base64 encoded)</p>
										<pre
											class="mt-2 max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs">{$executionStore
												.result.blob}</pre>
									</div>
								{:else}
									<pre
										class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
										{JSON.stringify($executionStore.result, null, 2)}
									</pre>
								{/if}
							{:else}
								<div class="text-sm text-green-700 dark:text-green-300">No content available.</div>
							{/if}
						</div>
					</Tabs.Content>

					<!-- Raw Tab -->
					<Tabs.Content value="raw">
						<div class="space-y-2">
							<div class="flex justify-end">
								<button
									class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
									on:click={() =>
										$executionStore.result &&
										copyToClipboard(JSON.stringify($executionStore.result, null, 2))}
								>
									Copy
								</button>
							</div>
							<pre
								class="max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs text-green-700 dark:text-green-300">
								{JSON.stringify($executionStore.result, null, 2)}
							</pre>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</Alert.Root>
	{/if}

	<!-- Error state -->
	{#if $executionStore.status === 'error'}
		<Alert.Root
			class="mt-4 border-red-500/40 bg-red-500/15 shadow-md dark:border-red-400/30 dark:bg-red-900/30"
		>
			<Alert.Title class="font-semibold text-red-700 dark:text-red-300">Error</Alert.Title>
			<Alert.Description class="text-red-600 dark:text-red-200">
				{$executionStore.error || 'An error occurred while loading the resource.'}
			</Alert.Description>
		</Alert.Root>
	{/if}
</div>
