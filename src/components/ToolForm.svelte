<script lang="ts">
	import { createForm3, RawForm } from "@sjsf/form";
	import { translation } from "@sjsf/form/translations/en";
	import { theme } from "@sjsf/shadcn-theme";
	import { validator } from "../routes/mcp/[id]/_validator";
	import { onSubmit } from "../routes/mcp/[id]/_on-submit";
	import type { UiSchema } from "@sjsf/form";

	export let tool: { name: string; inputSchema: any };

	const uiSchema: UiSchema = {};
	const initialValue = {};

	$: formattedOutput = (formValue: any) => JSON.stringify({
		name: tool.name,
		parameters: formValue || {}
	});
</script>

<div class="space-y-4">
	<h3 class="text-lg font-medium text-[#C8E9A0]">{tool.name}</h3>
	{#if Object.keys(tool.inputSchema?.properties || {}).length === 0}
		<div class="rounded-lg bg-[#000100] border border-[#C8E9A0]/20 p-4">
			<div class="flex justify-between items-center mb-2">
				<span class="text-sm text-[#B4D2E7]/60">Form Values</span>
				<button
					class="text-[#C8E9A0] hover:text-[#C8E9A0]/80 text-sm"
					on:click={() => {
						navigator.clipboard.writeText(formattedOutput({}));
					}}
				>
					Copy
				</button>
			</div>
			<pre class="text-sm font-mono text-[#B4D2E7]/90 overflow-auto">{formattedOutput({})}</pre>
		</div>
	{:else}
		{#key tool.inputSchema}
			{@const form = createForm3({
				...theme,
				initialValue,
				schema: tool.inputSchema,
				uiSchema: {
					...uiSchema,
					'ui:submitButtonOptions': { norender: true }
				},
				validator,
				translation,
				onSubmit,
			})}
			<div class="space-y-4">
				<RawForm {form} class="flex flex-col gap-4 dark" />
				<div class="rounded-lg bg-[#000100] border border-[#C8E9A0]/20 p-4">
					<div class="flex justify-between items-center mb-2">
						<span class="text-sm text-[#B4D2E7]/60">Form Values</span>
						<button
							class="text-[#C8E9A0] hover:text-[#C8E9A0]/80 text-sm"
							on:click={() => {
								navigator.clipboard.writeText(formattedOutput(form.value));
							}}
						>
							Copy
						</button>
					</div>
					<pre class="text-sm font-mono text-[#B4D2E7]/90 overflow-auto">{formattedOutput(form.value)}</pre>
				</div>
			</div>
		{/key}
	{/if}
</div> 