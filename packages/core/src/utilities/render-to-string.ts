import type { JSONCanvas, JSONCanvasFileNode, JSONCanvasNode, Parser } from '@repo/shared';

export default async function renderToString(options: {
	canvas: JSONCanvas;
	attachments?: Record<string, string>;
	attachmentDir?: string;
	parser?: Parser;
}) {
	const render = async (node: JSONCanvasNode) =>
		await renderer(node, options.parser ?? ((markdown: string) => markdown));
	const nodes = options.canvas.nodes ?? [];
	const basePath = options.attachmentDir ?? './';
	nodes.forEach((node) => {
		if (node.type === 'file' && !node.file.startsWith('http')) {
			const file = node.file.split('/');
			const name = file.pop() ?? '';
			node.file = options.attachments?.[name] ?? basePath + name;
		}
	});
	const renderedContent: Array<string> = [];
	await Promise.all(nodes.map(async (node) => renderedContent.push(await render(node))));
	return renderedContent.join('');
}

async function renderer(node: JSONCanvasNode, parse: Parser) {
	switch (node.type) {
		case 'text': {
			return await parse(node.text);
		}
		case 'file': {
			return await fileProcessor(node, parse);
		}
		case 'link': {
			return `<a href="${node.url}" target="_blank" rel="nofollow">${node.url}</a>`;
		}
		default: {
			return '';
		}
	}
}

async function fileProcessor(node: JSONCanvasFileNode, parse: Parser) {
	if (/\.md$/i.exec(node.file)) return await loadMarkdown(node.file, parse);
	else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.exec(node.file))
		return `<img src="${node.file}" alt="${node.file.split('/').pop()}">`;
	else if (/\.(mp3|wav)$/i.exec(node.file)) return `<audio src="${node.file}" controls></audio>`;
	return '';
}

async function loadMarkdown(path: string, parse: Parser) {
	let parsedContent: string;
	try {
		const response = await fetch(path);
		const result = await response.text();
		const frontmatterMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(result);
		parsedContent = await parse(frontmatterMatch ? frontmatterMatch[2] : result);
	} catch {
		parsedContent = 'Failed to load content.';
	}
	return parsedContent;
}
