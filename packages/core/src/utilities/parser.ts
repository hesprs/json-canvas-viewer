import purify from 'dompurify';
import { marked } from 'marked';

export default async function parser(markdown: string) {
	return purify.sanitize(await marked(markdown));
}
