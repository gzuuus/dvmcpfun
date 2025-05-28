<script lang="ts">
	import type { Implementation } from '@modelcontextprotocol/sdk/types.js';

	export let server: Implementation;
</script>

<div class="flex flex-wrap gap-2">
	{#if server.capabilities && typeof server.capabilities === 'object' && 'tools' in server.capabilities}
		<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
			Tools
		</span>
	{/if}
	{#if server.capabilities && typeof server.capabilities === 'object' && 'resources' in server.capabilities}
		<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
			Resources
		</span>
	{/if}
	{#if server.capabilities && typeof server.capabilities === 'object' && 'prompts' in server.capabilities}
		<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
			Prompts
		</span>
	{/if}
</div>
