<script lang="ts">
	let { size = 4, color = 'foreground', borderThickness = 4 } = $props();
</script>

<div
	class={`h-${size} w-${size} animate-spin rounded-full border-${borderThickness} border-${color} border-t-transparent`}
></div>
