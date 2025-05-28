<script lang="ts">
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { validator } from '../../routes/s/[identifier]/_validator';
	import { theme } from '@sjsf/shadcn-theme';
	import type { UiSchemaRoot } from '@sjsf/form';
	import { onDestroy } from 'svelte';
	import { capabilityExecutor } from '$lib/services/capabilityExecutor';
	import type { GetPromptRequest, Prompt } from '@modelcontextprotocol/sdk/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { copyToClipboard } from '$lib/utils';
	import Spinner from './spinner.svelte';
	import type { CapPricing } from '$lib/types';
	import type { JSONSchema7 } from 'json-schema';

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

	let uiSchema: UiSchemaRoot = {
		submitButton: {
			'ui:options': {
				title: 'Execute Prompt',
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

	// Get execution store for this prompt
	const executionStore = capabilityExecutor.getExecutionStore(prompt.name, 'prompt');

	// Handle form submission
	async function onSubmit(value: GetPromptRequest['params']['arguments']) {
		try {
			console.log('Executing prompt:', prompt.name, 'with arguments:', value);
			await capabilityExecutor.executePrompt(
				prompt,
				value || {},
				provider.providerPubkey,
				provider.serverId
			);
		} catch (error) {
			console.error('Prompt execution failed:', error);
		}
	}

	// Format the form values for display
	function formattedOutput(formValue: GetPromptRequest['params']['arguments'] | undefined) {
		return JSON.stringify(
			{
				name: prompt.name,
				arguments: formValue || {}
			},
			null,
			2
		);
	}

	// Clean up on component destroy
	onDestroy(() => {
		capabilityExecutor.resetExecutionState(prompt.name, 'prompt');
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

	{#key prompt.arguments}
		{@const schema = convertArgumentsToSchema(
			prompt.arguments as GetPromptRequest['params']['arguments']
		)}
		{@const createdForm = createForm3({
			...theme,
			initialValue,
			schema,
			uiSchema,
			translation,
			validator,
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
							This prompt requires a payment of {$executionStore.paymentInfo.amount}
							{$executionStore.paymentInfo.unit} to execute.
						</Alert.Description>
						<div class="mt-4 space-y-2">
							<div
								class="rounded-lg border border-amber-500/40 bg-background p-3 shadow-sm dark:border-amber-400/30 dark:bg-background/80"
							>
								<div class="mb-2 flex items-center justify-between">
									<span class="text-sm font-medium text-amber-700 dark:text-amber-300">Invoice</span
									>
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
									<pre
										class="overflow-auto text-xs text-amber-600 dark:text-amber-200">{$executionStore
											.paymentInfo.invoice}</pre>
								</div>
							</div>

							<p class="text-sm text-amber-600 dark:text-amber-200">
								Pay the invoice using a Lightning wallet. The prompt will automatically execute once
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
								<Alert.Title class="m-0 text-blue-400">Executing Prompt</Alert.Title>
							</div>
							<Alert.Description class="text-blue-300">
								Please wait while the prompt is being executed. This may take a few moments...
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
				The prompt executed successfully. View the results below.
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
								>Prompt Result</Tabs.Trigger
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
											if ($executionStore.result) {
												const content = Array.isArray($executionStore.result)
													? $executionStore.result
															.map(
																(msg) => msg.content?.text || JSON.stringify(msg.content, null, 2)
															)
															.join('\n\n')
													: JSON.stringify($executionStore.result, null, 2);
												copyToClipboard(content);
											}
										}}
									>
										Copy
									</button>
								</div>
								{#if $executionStore.result}
									{#if Array.isArray($executionStore.result)}
										<div class="space-y-4">
											{#each $executionStore.result as message}
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
														<pre
															class="whitespace-pre-wrap text-sm text-green-700 dark:text-green-300">
															{JSON.stringify(message.content, null, 2)}
														</pre>
													{/if}
												</div>
											{/each}
										</div>
									{:else}
										<pre class="whitespace-pre-wrap text-sm text-green-700 dark:text-green-300">
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
				{$executionStore.error || 'An error occurred while executing the prompt.'}
			</Alert.Description>
		</Alert.Root>
	{/if}
</div>
