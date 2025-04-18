<script lang="ts">
	import { createArticlesQuery } from '$lib/queries/docs';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	const pageTitle = 'Blog | DVMCP Fun';

	const articlesQuery = createArticlesQuery();
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold text-primary">Blog</h1>

	{#if $articlesQuery.isLoading}
		<div class="mt-8 rounded-lg border border-primary/50 p-8 text-center">
			<p>Loading articles...</p>
		</div>
	{:else if $articlesQuery.isError}
		<div class="mt-8 rounded-lg bg-destructive/10 p-8 text-center text-destructive">
			<p>Error loading articles: {$articlesQuery.error?.message || 'Unknown error'}</p>
		</div>
	{:else if $articlesQuery.data && $articlesQuery.data.length > 0}
		<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each $articlesQuery.data as article (article.id)}
				<div class="h-full">
					<ArticleCard {article} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="mt-8 rounded-lg bg-muted p-8 text-center">
			<p>No articles found.</p>
		</div>
	{/if}
</div>
