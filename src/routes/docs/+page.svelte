<script lang="ts">
	import { createDocsQuery, parseDocEvent, type LongFormArticleContent } from '$lib/queries/docs';
	import { marked } from 'marked';

	const pageTitle = 'Documentation | DVMCP Fun';

	// Author pubkey for documentation
	const authorPubkey = '6b3780ef2972e73d370b84a3e51e7aa9ae34bf412938dcfbd9c5f63b221416c8';

	// Create the query to fetch documentation
	const docsQuery = createDocsQuery(authorPubkey);

	let docsHtml: LongFormArticleContent[] = [];
	let isLoading = true;
	let error: string | null = null;

	// Process the documentation when data is loaded
	// Process the documentation when data is loaded
	$: if ($docsQuery.data) {
		isLoading = false;
		// Use Promise.all to handle async marked parsing
		Promise.all(
			$docsQuery.data.map(async (event) => {
				const doc = parseDocEvent(event);
				// Ensure we resolve the promise from marked.parse
				const html = await Promise.resolve(marked.parse(doc.content));
				return {
					id: doc.id,
					title: doc.title,
					html,
					summary: doc.summary,
					image: doc.image,
					publishedAt: doc.publishedAt,
					createdAt: doc.createdAt,
					tags: doc.tags
				};
			})
		).then((processedDocs) => {
			docsHtml = processedDocs;
		});
	}

	$: if ($docsQuery.isError) {
		isLoading = false;
		error = 'Failed to load documentation';
		console.error('Error loading docs:', $docsQuery.error);
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="docs-container">
	<h1>Documentation</h1>

	{#if isLoading}
		<div class="loading">
			<p>Loading documentation...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{:else if docsHtml.length === 0}
		<div class="no-docs">
			<p>No documentation found.</p>
		</div>
	{:else}
		<div class="docs-list">
			{#each docsHtml as doc (doc.id)}
				<article class="doc-article">
					<header>
						{#if doc.image}
							<div class="doc-image">
								<img src={doc.image} alt={doc.title} />
							</div>
						{/if}
						<h2>{doc.title}</h2>
						{#if doc.summary}
							<p class="summary">{doc.summary}</p>
						{/if}
						<div class="metadata">
							<span class="date">
								{new Date(
									doc.publishedAt ? doc.publishedAt * 1000 : doc.createdAt * 1000
								).toLocaleDateString()}
							</span>
							{#if doc.tags && doc.tags.length > 0}
								<div class="tags">
									{#each doc.tags as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</div>
					</header>
					<div class="doc-content">
						{@html doc.html}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	.docs-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}

	.loading,
	.error,
	.no-docs {
		text-align: center;
		padding: 2rem;
		background: #f9f9f9;
		border-radius: 8px;
		margin: 2rem 0;
	}

	.error {
		background: #fff0f0;
		color: #d00;
	}

	.doc-article {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #eee;
	}

	.doc-article:last-child {
		border-bottom: none;
	}

	.doc-image {
		margin-bottom: 1rem;
	}

	.doc-image img {
		max-width: 100%;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.summary {
		font-style: italic;
		color: #555;
		margin-bottom: 1rem;
	}

	.metadata {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 1.5rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background: #f0f0f0;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.doc-content {
		line-height: 1.6;
	}

	.doc-content :global(h1),
	.doc-content :global(h2),
	.doc-content :global(h3),
	.doc-content :global(h4),
	.doc-content :global(h5),
	.doc-content :global(h6) {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.doc-content :global(p) {
		margin-bottom: 1rem;
	}

	.doc-content :global(ul),
	.doc-content :global(ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	.doc-content :global(blockquote) {
		border-left: 4px solid #ddd;
		padding-left: 1rem;
		margin-left: 0;
		color: #555;
	}

	.doc-content :global(pre) {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.doc-content :global(code) {
		background: #f5f5f5;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.9em;
	}

	.doc-content :global(pre code) {
		padding: 0;
		background: transparent;
	}

	.doc-content :global(img) {
		max-width: 100%;
		border-radius: 4px;
	}

	.doc-content :global(a) {
		color: #0066cc;
		text-decoration: none;
	}

	.doc-content :global(a:hover) {
		text-decoration: underline;
	}
</style>
