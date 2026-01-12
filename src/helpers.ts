import { micromark } from 'micromark';
import { resolvePath } from '@/utilities';

type Parse = (markdown: string) => string;

// #region Render to String

export async function renderToString(path: string, micromarkOptions?: Parameters<typeof micromark>[1]) {
	const parse = (markdown: string) => micromark(markdown, micromarkOptions);
	const render = (node: JSONCanvasNode) => renderer(node, parse);
	const nodes = Object.assign(
		{
			nodes: [],
			edges: [],
		},
		await fetch(path).then(res => res.json()),
	).nodes as Array<JSONCanvasNode>;
	const basePath = resolvePath(path);
	nodes.forEach(node => {
		if (node.type === 'file' && !node.file.includes('http')) {
			const file = node.file.split('/');
			node.file = basePath + file.pop();
		}
	});
	let result = '';
	nodes.forEach(node => {
		result += render(node);
	});
	return result;
}

function renderer(node: JSONCanvasNode, parse: Parse) {
	switch (node.type) {
		case 'text':
			return parse(node.text);
		case 'file':
			return fileProcessor(node, parse);
		case 'link':
			return `<a href="${node.url}" target="_blank" rel="nofollow noreferrer">${node.url}</a>`;
		default:
			return '';
	}
}

function fileProcessor(node: JSONCanvasFileNode, parse: Parse) {
	if (node.file.match(/\.md$/i)) return loadMarkdown(node.file, parse);
	else if (node.file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i))
		return `<img src="${node.file}" alt="${node.file.split('/').pop()}">`;
	else if (node.file.match(/\.(mp3|wav)$/i)) return `<audio src="${node.file}" controls></audio>`;
}

async function loadMarkdown(path: string, parse: Parse) {
	let parsedContent: string;
	try {
		const response = await fetch(path);
		const result = await response.text();
		const frontmatterMatch = result.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		if (frontmatterMatch) parsedContent = parse(frontmatterMatch[2]);
		else parsedContent = parse(result);
	} catch {
		parsedContent = 'Failed to load content.';
	}
	return parsedContent;
}

// #endregion ==========================================================================

// #region Fetch Canvas
export async function fetchCanvas(path: string) {
	return {
		data: (await fetch(path).then(res => res.json())) as JSONCanvas,
		attachmentBaseDir: resolvePath(path),
	};
}
// #endregion ==========================================================================
