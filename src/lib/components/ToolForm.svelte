<script lang="ts">
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { theme } from '@sjsf/shadcn-theme';
	import type { FormOptions, UiSchemaRoot } from '@sjsf/form';
	import { onDestroy } from 'svelte';
	import { toolExecutor } from '$lib/services/toolExecutor';
	import { validator } from '../../routes/dvm/[id]/_validator';
	import { onSubmit } from '../../routes/dvm/[id]/_on-submit';
	import type { ExtendedDVMCP } from '$lib/types';
	import type { Tool } from '@modelcontextprotocol/sdk/types.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { JSONSchema7 } from 'json-schema';
	import { filterOptionalParameters } from '$lib/utils/tools';

	export let provider: ExtendedDVMCP;
	export let tool: Tool;

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

	const executionStore = toolExecutor.getExecutionStore(tool.name);

	$: formattedOutput = (formValue: Record<string, unknown> | undefined) => {
		const filteredParams = filterOptionalParameters(formValue, tool.inputSchema as JSONSchema7);
		return JSON.stringify({
			name: tool.name,
			parameters: filteredParams
		});
	};

	onDestroy(() => {
		toolExecutor.resetExecutionState(tool.name);
	});
</script>

<div class="space-y-4">
	{#key tool.inputSchema}
		{@const createdForm = createForm3({
			...theme,
			initialValue,
			schema: tool.inputSchema as FormOptions<string, string>['schema'],
			uiSchema,
			validator,
			translation,
			onSubmit: (value) => onSubmit(value, tool, provider.event.pubkey)
		})}
		{#if createdForm}
			<div class="space-y-4">
				<RawForm form={createdForm} class="dark flex flex-col gap-4" />
				{$executionStore.status === 'loading' ? 'Executing...' : ''}
				<div class="rounded-lg border border-primary/20 bg-background p-4">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-sm text-primary/50">Form Values</span>
						<button
							class="text-sm text-primary hover:text-primary/80"
							on:click={() => {
								navigator.clipboard.writeText(formattedOutput(createdForm.value));
							}}
						>
							Copy
						</button>
					</div>
					<pre class="overflow-auto font-mono text-sm text-primary/50">{formattedOutput(
							createdForm.value
						)}</pre>
				</div>
			</div>
		{/if}
	{/key}

	{#if $executionStore.status === 'success'}
		<div class="mt-4 rounded-lg border border-primary bg-background p-4">
			<div class="mb-2 flex items-center justify-between">
				<Tabs.Root value="result">
					<Tabs.List>
						<Tabs.Trigger value="result">Tool Result</Tabs.Trigger>
						<Tabs.Trigger value="raw">Raw</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="result">
						<div class="space-y-2">
							<button
								class="text-sm text-primary hover:text-primary/80"
								on:click={() => {
									navigator.clipboard.writeText($executionStore.result[0].text);
								}}
							>
								Copy
							</button>
							<div class="max-h-[800px] overflow-auto">
								<div class="w-full min-w-0">
									{#each $executionStore.result as result}
										<p class="whitespace-pre-wrap break-all text-xl font-bold">{result.text}</p>
									{/each}
								</div>
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="raw">
						<button
							class="text-sm text-primary hover:text-primary/80"
							on:click={() => {
								navigator.clipboard.writeText(JSON.stringify($executionStore.result, null, 2));
							}}
						>
							Copy
						</button>
						<pre class="overflow-auto font-mono text-sm text-primary/50">{JSON.stringify(
								$executionStore.result,
								null,
								2
							)}</pre>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>
	{:else if $executionStore.status === 'error'}
		<div class="mt-4 rounded-lg border border-red-500/30 bg-red-900/20 p-4">
			<h4 class="mb-2 font-medium text-red-400">Error</h4>
			<p class="text-red-300">{$executionStore.error}</p>
		</div>
	{/if}
</div>
