<script lang="ts">
	import { createArticlesQuery } from '$lib/queries/docs';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	const pageTitle = 'Documentation | DVMCP Fun';

	const articlesQuery = createArticlesQuery();
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="docs-container">
	<h1>Documentation</h1>

	{#if $articlesQuery.isLoading}
		<div class="loading">
			<p>Loading articles...</p>
		</div>
	{:else if $articlesQuery.isError}
		<div class="error">
			<p>Error loading articles: {$articlesQuery.error?.message || 'Unknown error'}</p>
		</div>
	{:else if $articlesQuery.data && $articlesQuery.data.length > 0}
		<div class="articles-grid">
			{#each $articlesQuery.data as article (article.id)}
				<div class="article-card-container">
					<ArticleCard {article} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="no-articles">
			<p>No articles found.</p>
		</div>
	{/if}
</div>

<style>
	.docs-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.article-card-container {
		height: 100%;
	}

	.loading,
	.error,
	.no-articles {
		margin-top: 2rem;
		text-align: center;
		padding: 2rem;
		background-color: var(--color-bg-secondary);
		border-radius: 0.5rem;
	}

	.error {
		color: var(--color-error);
	}
</style>
