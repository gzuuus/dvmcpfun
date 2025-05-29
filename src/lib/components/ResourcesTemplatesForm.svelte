<script lang="ts">
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { ResourceTemplate, ReadResourceRequest } from '@modelcontextprotocol/sdk/types.js';
	import type { CapPricing, ProviderServerMeta } from '$lib/types';
	import CapabilityForm from './CapabilityForm.svelte';
	import { logger } from '$lib/utils/logger';
	import qrcode from 'qrcode-generator';
	import type { JSONSchema7 } from 'json-schema';
	import { createSchemaFromUriTemplate, populateUriTemplate } from '$lib/utils/schemaUtils';

	export let provider: ProviderServerMeta;
	export let resourceTemplate: ResourceTemplate;
	export let pricing: CapPricing | undefined = undefined;

	const { schema, parameters: templateParameters } = createSchemaFromUriTemplate(
		resourceTemplate.uriTemplate
	);

	let currentPopulatedUri: string = '';

	async function onSubmit(values: Record<string, string>) {
		if (!provider.providerPubkey || !provider.serverId) {
			logger.error('Provider pubkey or server ID not found', 'ResourcesTemplatesForm:onSubmit');
			return;
		}

		try {
			const populatedUri = populateUriTemplate(resourceTemplate.uriTemplate, values);
			currentPopulatedUri = populatedUri;
			logger.debug(`Populated URI: ${populatedUri}`, 'ResourcesTemplatesForm:onSubmit');

			await capabilityExecutor.executeResourceTemplate(
				{ ...resourceTemplate, uriTemplate: populatedUri },
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			logger.error('Error reading resource', error, 'ResourcesTemplatesForm:onSubmit');
		}
	}

	$: resourceExecutionStore = capabilityExecutor.getExecutionStore({
		method: 'resources/read',
		params: { uri: currentPopulatedUri }
	});

	let qrCodeSvg = '';
	$: {
		if ($resourceExecutionStore.paymentInfo?.invoice) {
			const qr = qrcode(0, 'L');
			qr.addData($resourceExecutionStore.paymentInfo.invoice);
			qr.make();
			qrCodeSvg = qr.createSvgTag({ cellSize: 4, margin: 2 });
		}
	}
</script>

<CapabilityForm
	capabilityName={currentPopulatedUri}
	capabilityType="resource"
	{pricing}
	{schema}
	{onSubmit}
>
	<div slot="payment-qr-code">
		<div class="flex justify-center rounded-md bg-white p-4 shadow-sm">
			{@html qrCodeSvg}
		</div>
	</div>

	<!-- Resource template details -->
	<div slot="form-content">
		<div class="mb-4 rounded-lg border border-primary/20 bg-background p-4">
			<h3 class="mb-2 text-lg font-medium text-primary">Resource Template Details</h3>
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

			<!-- Show parameters if any -->
			{#if templateParameters.length > 0}
				<p class="mt-2 text-foreground">
					<span class="font-medium">Parameters:</span>
					{templateParameters.join(', ')}
				</p>
			{:else}
				<p class="mt-2 italic text-foreground">No parameters to populate</p>
			{/if}
		</div>
	</div>

	<!-- Results display -->
	<div slot="success-result">
		{#if $resourceExecutionStore.result}
			{#if Array.isArray($resourceExecutionStore.result)}
				{#each $resourceExecutionStore.result as item}
					<!-- Text content -->
					{#if item.text}
						<div class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
							{item.text}
						</div>
						<!-- Binary/blob content -->
					{:else if item.blob}
						<div class="text-sm text-green-700 dark:text-green-300">
							<p>Binary data (base64 encoded)</p>
							<!-- Display images directly -->
							{#if item.mimeType?.startsWith('image/')}
								<img
									src={`data:${item.mimeType};base64,${item.blob}`}
									alt="Resource content"
									class="mt-2 max-h-96 rounded-md"
								/>
								<!-- Display other binary data as text -->
							{:else}
								<pre class="mt-2 max-h-96 overflow-auto rounded-md bg-background/80 p-2 text-xs">
									{item.blob}
								</pre>
							{/if}
						</div>
						<!-- Other content types -->
					{:else}
						<pre class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
							{JSON.stringify(item, null, 2)}
						</pre>
					{/if}
				{/each}
				<!-- Non-array result -->
			{:else}
				<pre class="whitespace-pre-wrap font-mono text-sm text-green-700 dark:text-green-300">
					{JSON.stringify($resourceExecutionStore.result, null, 2)}
				</pre>
			{/if}
		{/if}
	</div>
</CapabilityForm>
