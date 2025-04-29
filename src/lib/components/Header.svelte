<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Moon, Sun } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';
	import LoginDialog from './loginDialog.svelte';
</script>

<header class="border-b border-primary/20">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-y-2 px-4 py-4 md:flex-row md:px-6"
	>
		<div class="flex w-full items-center justify-center md:w-auto md:justify-start">
			<a href="/" class="no-underline">
				<span class="my-1 text-3xl font-bold leading-none text-primary">DVMCP.fun</span>
			</a>
		</div>
		<div
			class="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:justify-end md:gap-4"
		>
			<a
				href="/blog"
				class="flex items-center rounded-md px-4 py-2 font-medium text-primary no-underline transition-colors hover:bg-muted"
			>
				Blog
			</a>
			<a
				href="/stats"
				class="flex items-center rounded-md px-4 py-2 font-medium text-primary no-underline transition-colors hover:bg-muted"
			>
				Stats
			</a>
			<a
				href="https://github.com/gzuuus/dvmcp"
				target="_blank"
				rel="noopener noreferrer"
				class="truncate rounded-md bg-primary px-4 py-2 text-background no-underline transition-colors hover:bg-primary/70"
			>
				Build your own
			</a>
			<LoginDialog />
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
