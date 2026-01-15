import { useEffect, useRef } from 'react';
import JSONCanvasViewer from '$';
import type { ModuleInputCtor, UserOptions } from '$/declarations';

export default function JSONCanvasViewerReact<T extends ModuleInputCtor>({
	modules,
	options,
	prerenderedContent = '',
	className,
	style,
	id,
}: {
	modules: T;
	options: Omit<UserOptions<T>, 'container'>;
	prerenderedContent?: string;
	className?: string;
	style?: React.CSSProperties;
	id?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const instance = new JSONCanvasViewer(
			Object.assign(options, { container: containerRef.current }) as UserOptions<T>,
			modules,
		);
		return instance.dispose;
	}, []);

	return (
		<section
			ref={containerRef}
			dangerouslySetInnerHTML={{ __html: prerenderedContent }}
			style={style}
			className={className}
			id={id}
		/>
	);
}
