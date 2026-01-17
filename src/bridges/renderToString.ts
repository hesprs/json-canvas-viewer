import type { MarkdownParser } from '$/declarations';

export default async function (options: {
	canvas: JSONCanvas;
	attachmentDir?: string;
	markdownParser?: MarkdownParser;
}) {
	const render = async (node: JSONCanvasNode) =>
		await renderer(node, options.markdownParser || ((markdown: string) => markdown));
	const nodes = options.canvas.nodes || [];
	const basePath = options.attachmentDir || './';
	nodes.forEach((node) => {
		if (node.type === 'file' && !node.file.includes('http')) {
			const file = node.file.split('/');
			node.file = basePath + file.pop();
		}
	});
	let result = '';
	nodes.forEach(async (node) => {
		result += await render(node);
	});
	return result;
}

async function renderer(node: JSONCanvasNode, parse: MarkdownParser) {
	switch (node.type) {
		case 'text':
			return await parse(node.text);
		case 'file':
			return await fileProcessor(node, parse);
		case 'link':
			return `<a href="${node.url}" target="_blank" rel="nofollow">${node.url}</a>`;
		default:
			return '';
	}
}

async function fileProcessor(node: JSONCanvasFileNode, parse: MarkdownParser) {
	if (node.file.match(/\.md$/i)) return await loadMarkdown(node.file, parse);
	else if (node.file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))
		return `<img src="${node.file}" alt="${node.file.split('/').pop()}">`;
	else if (node.file.match(/\.(mp3|wav)$/i)) return `<audio src="${node.file}" controls></audio>`;
	return '';
}

async function loadMarkdown(path: string, parse: MarkdownParser) {
	let parsedContent: string;
	try {
		const response = await fetch(path);
		const result = await response.text();
		const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		if (frontmatterMatch) parsedContent = await parse(frontmatterMatch[2]);
		else parsedContent = await parse(result);
	} catch {
		parsedContent = 'Failed to load content.';
	}
	return parsedContent;
}
