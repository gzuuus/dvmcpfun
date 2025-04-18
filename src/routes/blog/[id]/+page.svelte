<script lang="ts">
	import { page } from '$app/state';
	import { createArticleQuery } from '$lib/queries/docs';
	import { formatDate } from '$lib/utils';
	import { marked } from 'marked';

	const articleQuery = createArticleQuery(page.params.id);

	$: pageTitle = $articleQuery.data
		? `${$articleQuery.data.title} | DVMCP Fun`
		: 'Loading Article | DVMCP Fun';
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<a href="/blog" class="mb-6 inline-block font-medium text-primary no-underline hover:underline"
		>← Back to Blog</a
	>

	{#if $articleQuery.isLoading}
		<div class="mt-8 rounded-lg border border-primary/50 p-8 text-center">
			<p>Loading article...</p>
		</div>
	{:else if $articleQuery.isError}
		<div class="mt-8 rounded-lg bg-destructive/10 p-8 text-center text-destructive">
			<p>Error loading article: {$articleQuery.error?.message || 'Unknown error'}</p>
		</div>
	{:else if $articleQuery.data}
		<article class="mb-8">
			<header class="mb-8">
				<h1 class="mb-4 text-3xl font-bold text-primary">{$articleQuery.data.title}</h1>

				<div class="mb-4 text-sm text-muted-foreground">
					<time
						datetime={new Date(
							($articleQuery.data.publishedAt || $articleQuery.data.createdAt) * 1000
						).toISOString()}
					>
						{formatDate($articleQuery.data.publishedAt || $articleQuery.data.createdAt)}
					</time>
				</div>
			</header>
			{#if $articleQuery.data.image}
				<div class="mb-8 overflow-hidden rounded-lg">
					<img
						src={$articleQuery.data.image}
						alt={$articleQuery.data.title}
						class="h-auto w-full object-cover"
					/>
				</div>
			{/if}
			<div
				class="prose prose-zinc dark:prose-invert prose-code:bg-zinc-100 dark:prose-code:bg-zinc-900 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900 prose-pre:rounded-lg prose-pre:p-4 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground max-w-none"
			>
				{#if $articleQuery.data.content}
					{#await marked.parse($articleQuery.data.content) then renderedContent}
						{@html renderedContent}
					{/await}
				{/if}
			</div>
		</article>
	{:else}
		<div class="mt-8 rounded-lg bg-muted p-8 text-center">
			<p>Article not found.</p>
		</div>
	{/if}
</div>
