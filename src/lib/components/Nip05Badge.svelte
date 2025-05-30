<script lang="ts">
	import Spinner from './spinner.svelte';
	import { Check } from 'lucide-svelte';
	import X from '@lucide/svelte/icons/x';
	let {
		nip05,
		isLoading = false,
		isValid = undefined,
		maxWidthClass = 'max-w-[16ch]',
		textColor = 'text-foreground/40',
		checkColor = 'text-foreground/70',
		errorColor = 'text-destructive/70',
		iconSize = 16
	}: {
		nip05: string;
		isLoading?: boolean;
		isValid?: boolean;
		maxWidthClass?: string;
		textColor?: string;
		checkColor?: string;
		errorColor?: string;
		iconSize?: number;
	} = $props();
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
