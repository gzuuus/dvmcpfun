<script lang="ts">
	import { onDestroy } from 'svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { Resource } from '@modelcontextprotocol/sdk/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { copyToClipboard } from '$lib/utils';
	import Spinner from './spinner.svelte';
	import type { CapPricing } from '$lib/types';

	export let provider: { providerPubkey: string; serverId: string };
	export let resource: Resource;
	// Optional pricing information
	export let pricing: CapPricing | undefined = undefined;

	// Get execution store for this resource
	const executionStore = capabilityExecutor.getExecutionStore(resource.name, 'resource');

	// Function to execute resource read
	async function readResource() {
		try {
			await capabilityExecutor.executeResource(
				resource,
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			console.error('Error reading resource:', error);
		}
	}

	// Clean up on component destroy
	onDestroy(() => {
		capabilityExecutor.resetExecutionState(resource.name, 'resource');
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

	<div class="space-y-4">
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
			on:click={readResource}
			disabled={$executionStore.status === 'loading' ||
				$executionStore.status === 'payment-required'}
		>
			Read Resource
		</button>

		{#if $executionStore.status === 'loading'}
			<Alert.Root class="flex flex-col gap-2 border-blue-500/30 bg-blue-500/10">
				<div class="flex items-center gap-2">
					<Spinner size={4} borderThickness={4} />
					<Alert.Title class="m-0 text-blue-400">Reading Resource</Alert.Title>
				</div>
				<Alert.Description class="text-blue-300">
					Please wait while the resource is being read. This may take a few moments...
				</Alert.Description>
			</Alert.Root>
		{/if}

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
								on:click={() => {
									if ($executionStore.paymentInfo?.invoice) {
										copyToClipboard($executionStore.paymentInfo.invoice);
									}
								}}
							>
								Copy Invoice
							</button>
						</div>
						<div class="rounded-md bg-background/80 p-2">
							<pre class="overflow-auto text-xs text-amber-600 dark:text-amber-200">{$executionStore
									.paymentInfo.invoice}</pre>
						</div>
					</div>

					<p class="text-sm text-amber-600 dark:text-amber-200">
						Pay the invoice using a Lightning wallet. The resource will automatically be read once
						payment is confirmed.
					</p>
				</div>
			</Alert.Root>
		{/if}

		{#if $executionStore.status === 'success'}
			<Alert.Root
				class="mt-4 border-green-500/40 bg-green-500/15 shadow-md dark:border-green-400/30 dark:bg-green-900/30"
			>
				<Alert.Title class="font-semibold text-green-700 dark:text-green-300">Success</Alert.Title>
				<Alert.Description class="text-green-600 dark:text-green-200">
					The resource was read successfully. View the contents below.
				</Alert.Description>
				<div
					class="mt-4 rounded-lg border border-green-500/40 bg-background p-4 shadow-sm dark:border-green-400/30 dark:bg-background/80"
				>
					<div class="mb-2">
						<Tabs.Root value="content">
							<Tabs.List>
								<Tabs.Trigger
									value="content"
									class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
									>Content</Tabs.Trigger
								>
								<Tabs.Trigger
									value="raw"
									class="text-green-700 data-[state=active]:border-green-600 data-[state=active]:text-green-700 dark:text-green-300 dark:data-[state=active]:border-green-300 dark:data-[state=active]:text-primary-foreground"
									>Raw</Tabs.Trigger
								>
							</Tabs.List>
							<Tabs.Content value="content">
								<div class="space-y-2">
									<div class="flex justify-end">
										<button
											class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
											on:click={() => {
												if ($executionStore.result) {
													const content = Array.isArray($executionStore.result)
														? $executionStore.result[0]?.text ||
															JSON.stringify($executionStore.result, null, 2)
														: $executionStore.result.text ||
															JSON.stringify($executionStore.result, null, 2);
													copyToClipboard(content);
												}
											}}
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
															<pre
																class="mt-2 max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs">
																{item.blob}
															</pre>
														{/if}
													</div>
												{:else}
													<pre
														class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
														{JSON.stringify(item, null, 2)}
													</pre>
												{/if}
											{/each}
										{:else}
											<pre
												class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
												{JSON.stringify($executionStore.result, null, 2)}
											</pre>
										{/if}
									{/if}
								</div>
							</Tabs.Content>
							<Tabs.Content value="raw">
								<div class="flex justify-end">
									<button
										class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-green-500/40 bg-background px-3 text-sm font-medium text-green-700 shadow-sm ring-offset-background transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-green-400/30 dark:text-green-300 dark:hover:bg-green-900/20"
										on:click={() => {
											if ($executionStore.result) {
												copyToClipboard(JSON.stringify($executionStore.result, null, 2));
											}
										}}
									>
										Copy
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
					{$executionStore.error || 'An error occurred while reading the resource.'}
				</Alert.Description>
			</Alert.Root>
		{/if}
	</div>
</div>
