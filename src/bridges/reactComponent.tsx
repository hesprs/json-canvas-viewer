import type { ModuleInputCtor } from '$/BaseModule';
import JSONCanvasViewer, { type AllOptions, type JSONCanvasViewerInterface } from '$';
import { useEffect, useRef } from 'react';

export default function JSONCanvasViewerReact<T extends ModuleInputCtor>({
	modules,
	options,
	prerenderedContent = '',
	className,
	style,
	id,
	theme,
	canvas,
	attachmentDir,
}: {
	modules?: T;
	options?: Omit<AllOptions<T>, 'container' | 'theme' | 'canvas' | 'attachmentDir'>;
	prerenderedContent?: string;
	className?: string;
	style?: React.CSSProperties;
	id?: string;
	theme?: 'dark' | 'light';
	canvas?: JSONCanvas;
	attachmentDir?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const instanceRef = useRef<null | JSONCanvasViewerInterface>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const instance = new JSONCanvasViewer(
			Object.assign(options ?? {}, {
				container: containerRef.current,
				canvas,
				attachmentDir,
				theme,
			}) as AllOptions<T>,
			modules,
		);
		instanceRef.current = instance;
		return instance.dispose;
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
	}, [options, modules]);

	useEffect(() => {
		if (!instanceRef.current) return;
		instanceRef.current.changeTheme(theme);
	});

	useEffect(() => {
		if (!instanceRef.current) return;
		instanceRef.current.load({ canvas, attachmentDir });
	});

	return (
		<section
			ref={containerRef}
			dangerouslySetInnerHTML={{ __html: prerenderedContent }}
			style={{ maxWidth: '100vw', maxHeight: '100vh', ...style }}
			className={className}
			id={id}
		/>
	);
}
