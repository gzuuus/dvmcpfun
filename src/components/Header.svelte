<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Moon, Sun } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<header class="border-b border-primary/20">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
		<div class="flex items-center gap-4">
			<a href="/">
				<h1 class="text-2xl font-bold text-primary">DVMCP.fun</h1>
			</a>
		</div>
		<div class="flex gap-4">
			<a
				href="https://github.com/gzuuus/dvmcp"
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-md bg-primary px-4 py-2 text-background transition-colors hover:bg-primary/70"
			>
				Build your own
			</a>
			<Button onclick={toggleMode} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
