<script lang="ts">
	import Spinner from './spinner.svelte';
	import { Check } from 'lucide-svelte';
	import X from '@lucide/svelte/icons/x';
	export let nip05: string;
	export let isLoading: boolean = false;
	export let isValid: boolean | undefined = undefined;
	export let maxWidthClass: string = 'max-w-[16ch]';
	export let textColor: string = 'text-foreground/40';
	export let checkColor: string = 'text-foreground/70';
	export let errorColor: string = 'text-destructive/70';
	export let iconSize: number = 16;
</script>

{#if isLoading}
	<Spinner color="currentColor" size={2} borderThickness={2} />
	<span
		class={`flex ${maxWidthClass} items-center gap-1 truncate font-mono text-xs ${textColor}`}
		title={nip05}
	>
		{nip05}
	</span>
{:else if isValid}
	<Check size={iconSize} />
	<span
		class={`flex ${maxWidthClass} items-center gap-1 truncate font-mono text-xs ${checkColor}`}
		title={nip05}
	>
		{nip05}
	</span>
{:else}
	<X class="text-destructive" size={iconSize} />
	<span
		class={`flex ${maxWidthClass} items-center gap-1 truncate font-mono text-xs ${errorColor}`}
		title={nip05}
	>
		{nip05}
	</span>
{/if}
