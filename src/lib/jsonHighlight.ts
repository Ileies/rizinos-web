/** Minimal JSON syntax highlighter. Returns HTML with colored spans for keys, strings, numbers, booleans and null. */
export function highlightJson(data: unknown, indent: number | undefined = 2): string {
	const json = JSON.stringify(data, null, indent)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	return json.replace(
		/"(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
		(match) => {
			let cls = 'text-amber-600 dark:text-amber-400'; // number
			if (match.startsWith('"')) {
				cls = match.endsWith(':')
					? 'text-sky-600 dark:text-sky-400' // key
					: 'text-emerald-600 dark:text-emerald-400'; // string
			} else if (match === 'true' || match === 'false') {
				cls = 'text-purple-600 dark:text-purple-400';
			} else if (match === 'null') {
				cls = 'text-muted-foreground';
			}
			return `<span class="${cls}">${match}</span>`;
		}
	);
}
