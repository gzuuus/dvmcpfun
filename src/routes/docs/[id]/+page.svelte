<script lang="ts">
	import { page } from '$app/state';
	import { createArticleQuery } from '$lib/queries/docs';
	import { marked } from 'marked';

	// Get the article ID from the route params
	const articleId = page.params.id;

	// Create the query to fetch the article
	const articleQuery = createArticleQuery(articleId);

	// Dynamic page title
	$: pageTitle = $articleQuery.data
		? `${$articleQuery.data.title} | DVMCP Fun`
		: 'Loading Article | DVMCP Fun';
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="article-container">
	<a href="/docs" class="back-link">← Back to Documentation</a>

	{#if $articleQuery.isLoading}
		<div class="loading">
			<p>Loading article...</p>
		</div>
	{:else if $articleQuery.isError}
		<div class="error">
			<p>Error loading article: {$articleQuery.error?.message || 'Unknown error'}</p>
		</div>
	{:else if $articleQuery.data}
		<article class="article">
			<header class="article-header">
				<h1 class="article-title">{$articleQuery.data.title}</h1>

				{#if $articleQuery.data.summary}
					<p class="article-summary">{$articleQuery.data.summary}</p>
				{/if}

				<div class="article-meta">
					<time
						datetime={new Date(
							($articleQuery.data.publishedAt || $articleQuery.data.createdAt) * 1000
						).toISOString()}
					>
						{new Date(
							($articleQuery.data.publishedAt || $articleQuery.data.createdAt) * 1000
						).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				</div>
			</header>

			{#if $articleQuery.data.image}
				<div class="article-featured-image">
					<img src={$articleQuery.data.image} alt={$articleQuery.data.title} />
				</div>
			{/if}

			<div class="article-content">
				{#if $articleQuery.data.content}
					{#await marked.parse($articleQuery.data.content) then renderedContent}
						{@html renderedContent}
					{/await}
				{/if}
			</div>
		</article>
	{:else}
		<div class="not-found">
			<p>Article not found.</p>
		</div>
	{/if}
</div>

<style>
	.article-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.article-header {
		margin-bottom: 2rem;
	}

	.article-title {
		margin-bottom: 1rem;
		font-size: 2.5rem;
		line-height: 1.2;
	}

	.article-summary {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.article-meta {
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
	}

	.article-featured-image {
		margin-bottom: 2rem;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.article-featured-image img {
		width: 100%;
		height: auto;
		display: block;
	}

	.article-content {
		line-height: 1.7;
		font-size: 1.125rem;
	}

	.article-content :global(h2) {
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-size: 1.75rem;
	}

	.article-content :global(h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		font-size: 1.5rem;
	}

	.article-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.article-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.article-content :global(pre) {
		background-color: var(--color-bg-secondary);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 1.5rem;
	}

	.article-content :global(code) {
		font-family: monospace;
		background-color: var(--color-bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
	}

	.article-content :global(blockquote) {
		border-left: 4px solid var(--color-primary);
		padding-left: 1rem;
		margin-left: 0;
		margin-right: 0;
		font-style: italic;
		color: var(--color-text-secondary);
	}

	.loading,
	.error,
	.not-found {
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
