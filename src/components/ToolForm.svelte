<script lang="ts">
	import { createForm3, RawForm } from '@sjsf/form';
	import { translation } from '@sjsf/form/translations/en';
	import { theme } from '@sjsf/shadcn-theme';
	import { validator } from '../routes/s/[id]/_validator';
	import { onSubmit } from '../routes/s/[id]/_on-submit';
	import type { UiSchemaRoot } from '@sjsf/form';
	import { onDestroy } from 'svelte';
	import { toolExecutor } from '$lib/services/toolExecutor';
	import type { McpTool } from '$lib/queries/tools';

	export let provider: McpTool;
	export let tool: { name: string; inputSchema: any };

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

	$: formattedOutput = (formValue: any) =>
		JSON.stringify({
			name: tool.name,
			parameters: formValue || {}
		});

	onDestroy(() => {
		toolExecutor.resetExecutionState(tool.name);
	});
</script>

<div class="space-y-4">
	<h3 class="text-lg font-medium text-primary">{tool.name}</h3>
	{#key tool.inputSchema}
		{@const createdForm = createForm3({
			...theme,
			initialValue,
			schema: tool.inputSchema,
			uiSchema,
			validator,
			translation,
			onSubmit: (value) => onSubmit(value, tool, provider.author)
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
				<span class="text-sm text-primary/50">Tool Result</span>
				<button
					class="text-sm text-primary hover:text-primary/80"
					on:click={() => {
						navigator.clipboard.writeText(JSON.stringify($executionStore.result, null, 2));
					}}
				>
					Copy
				</button>
			</div>
			<pre class="overflow-auto font-mono text-sm text-primary/50">{JSON.stringify(
					$executionStore.result,
					null,
					2
				)}</pre>
		</div>
	{:else if $executionStore.status === 'error'}
		<div class="mt-4 rounded-lg border border-red-500/30 bg-red-900/20 p-4">
			<h4 class="mb-2 font-medium text-red-400">Error</h4>
			<p class="text-red-300">{$executionStore.error}</p>
		</div>
	{/if}
</div>
