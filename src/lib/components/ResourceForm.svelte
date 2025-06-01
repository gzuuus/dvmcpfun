<script lang="ts">
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { Resource } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing, ProviderServerMeta } from '$lib/types';
	import CapabilityForm from './CapabilityForm.svelte';
	import { logger } from '$lib/utils/logger';
	import qrcode from 'qrcode-generator';

	let {
		provider,
		resource,
		pricing = undefined
	}: {
		provider: ProviderServerMeta;
		resource: Resource;
		pricing?: CapPricing;
	} = $props();

	// Function to execute resource read
	async function readResource() {
		if (!provider.providerPubkey || !provider.serverId) {
			logger.error('Provider pubkey or server ID not found', 'ResourceForm:readResource');
			return;
		}
		try {
			await capabilityExecutor.executeResource(
				resource,
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			logger.error('Error reading resource', error, 'ResourceForm:readResource');
		}
	}

	// Create a dummy RequestType to get the store
	import type { ReadResourceRequest } from '@modelcontextprotocol/sdk/types.js';

	function createResourceRequest(uri: string): ReadResourceRequest {
		return { method: 'resources/read', params: { uri } };
	}

	// Get the execution store for this specific resource
	const resourceExecutionStore = $derived(
		capabilityExecutor.getExecutionStore(createResourceRequest(resource.uri))
	);

	// Generate QR code for payment invoice
	let qrCodeSvg = $state('');
	$effect(() => {
		if ($resourceExecutionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($resourceExecutionStore.paymentInfo.invoice);
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
{#snippet formContent()}
	<div class="rounded-lg border border-primary/20 bg-background p-4">
		<h3 class="mb-2 text-lg font-medium text-primary">Resource Details</h3>
		<p class="mb-2 text-foreground">
			<span class="font-medium">URI:</span>
			{resource.uri}
		</p>
		{#if resource.mimeType}
			<p class="text-foreground">
				<span class="font-medium">MIME Type:</span>
				{resource.mimeType}
			</p>
		{/if}
	</div>

	<button
		class="w-fit rounded-md bg-primary px-4 py-2 text-background hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
		onclick={readResource}
		disabled={$resourceExecutionStore.status === 'loading' ||
			$resourceExecutionStore.status === 'payment-required'}
	>
		Read Resource
	</button>
{/snippet}

{#snippet successResult()}
	{#if $resourceExecutionStore.result}
		{#if Array.isArray($resourceExecutionStore.result)}
			{#each $resourceExecutionStore.result as item}
				{#if item.text}
					<div class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
						{item.text}
					</div>
				{:else if item.blob}
					<div class="text-sm text-green-700 dark:text-green-300">
						<p>Binary data (base64 encoded)</p>
						{#if item.mimeType?.startsWith('image/')}
							<img
								src={`data:${item.mimeType};base64,${item.blob}`}
								alt="Resource content"
								class="mt-2 max-h-96 rounded-md"
							/>
						{:else}
							<pre class="mt-2 max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs">
								{item.blob}
							</pre>
						{/if}
					</div>
				{:else}
					<pre class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
						{JSON.stringify(item, null, 2)}
					</pre>
				{/if}
			{/each}
		{:else}
			<pre class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
				{JSON.stringify($resourceExecutionStore.result, null, 2)}
			</pre>
		{/if}
	{/if}
{/snippet}

<CapabilityForm
	capabilityName={resource.uri}
	capabilityType="resource"
	{pricing}
	schema={undefined}
	uiSchema={undefined}
	onSubmit={undefined}
	initialValue={{}}
	payment-qr-code={paymentQrCode}
	form-content={formContent}
	success-result={successResult}
/>
