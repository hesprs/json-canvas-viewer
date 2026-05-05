import type {
	Options,
	JSONCanvasViewerInterface,
	GeneralModuleCtor,
	Hook,
	JSONCanvasTextNode,
	JSONCanvasLinkNode,
	JSONCanvasFileNode,
	JSONCanvas,
} from 'json-canvas-viewer';
import type { CSSProperties, ReactNode } from 'react';
import { JSONCanvasViewer } from 'json-canvas-viewer';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { createPortal, flushSync } from 'react-dom';

type ModuleInputCtor = Array<GeneralModuleCtor>;

type TextSlotProps = {
	content: string;
	node: JSONCanvasTextNode;
	onActive: Hook;
	onLoseActive: Hook;
};
type LinkSlotProps = {
	content: string;
	node: JSONCanvasLinkNode;
	onActive: Hook;
	onLoseActive: Hook;
};
type FileSlotProps = {
	content: string;
	node: JSONCanvasFileNode;
	onActive: Hook;
	onLoseActive: Hook;
};

type ViewerHandle<T extends ModuleInputCtor> = {
	viewer?: JSONCanvasViewerInterface<T>;
};

type ViewerProps<T extends ModuleInputCtor> = {
	modules?: T;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	attachments?: Record<string, string>;
	theme?: 'dark' | 'light';
	options?: Omit<
		Options<T>,
		'container' | 'theme' | 'canvas' | 'attachmentDir' | 'nodeComponents' | 'attachments'
	>;
	text?: (props: TextSlotProps) => ReactNode;
	markdown?: (props: FileSlotProps) => ReactNode;
	image?: (props: FileSlotProps) => ReactNode;
	video?: (props: FileSlotProps) => ReactNode;
	audio?: (props: FileSlotProps) => ReactNode;
	link?: (props: LinkSlotProps) => ReactNode;
	prerenderHtml?: string;
	className?: string;
	style?: CSSProperties;
};

type PortalEntry = {
	id: string;
	container: HTMLDivElement;
	element: ReactNode;
};

function useLatest<T>(value: T) {
	const ref = useRef(value);
	ref.current = value;
	return ref;
}

export default forwardRef(function ViewerInner<T extends ModuleInputCtor>(
	{
		attachmentDir,
		attachments,
		canvas,
		theme,
		modules,
		className,
		style,
		prerenderHtml,
		options = {} as ViewerProps<T>['options'],
		text,
		markdown,
		image,
		video,
		audio,
		link,
	}: ViewerProps<T>,
	ref: React.ForwardedRef<ViewerHandle<T>>,
) {
	const containerRef = useRef<HTMLElement | undefined>(undefined);
	const viewerRef = useRef<JSONCanvasViewerInterface<T> | undefined>(undefined);
	const textRef = useLatest(text);
	const markdownRef = useLatest(markdown);
	const imageRef = useLatest(image);
	const videoRef = useLatest(video);
	const audioRef = useLatest(audio);
	const linkRef = useLatest(link);
	const portalsByIdRef = useRef(new Map<string, PortalEntry>());
	const [, forceRender] = useState(0);

	function upsertPortal(id: string, container: HTMLDivElement, element: ReactNode) {
		portalsByIdRef.current.set(id, { container, element, id });
		flushSync(() => forceRender((x) => x + 1));
	}
	function removePortalById(id: string) {
		portalsByIdRef.current.delete(id);
	}

	useImperativeHandle(ref, () => ({ viewer: viewerRef.current }), []);

	const nodeComponents = useMemo<Options['nodeComponents']>(() => {
		function createNodeFunc<N extends TextSlotProps | FileSlotProps | LinkSlotProps>(
			getRenderFn: () => ((props: N) => ReactNode) | undefined,
		) {
			return ({
				container,
				content,
				node,
				onBeforeUnmount,
				onActive,
				onLoseActive,
			}: {
				container: HTMLDivElement;
				content: string;
				node: N['node'];
				onBeforeUnmount: Hook;
				onActive: Hook;
				onLoseActive: Hook;
			}) => {
				const renderFn = getRenderFn();
				if (!renderFn) return;
				upsertPortal(
					node.id,
					container,
					renderFn({
						content,
						node,
						onActive,
						onLoseActive,
					} as N),
				);
				onBeforeUnmount.subscribe(() => {
					removePortalById(node.id);
				});
			};
		}

		const out: Options['nodeComponents'] = {};
		if (text) out.text = createNodeFunc<TextSlotProps>(() => textRef.current);
		if (markdown) out.markdown = createNodeFunc<FileSlotProps>(() => markdownRef.current);
		if (image) out.image = createNodeFunc<FileSlotProps>(() => imageRef.current);
		if (video) out.video = createNodeFunc<FileSlotProps>(() => videoRef.current);
		if (audio) out.audio = createNodeFunc<FileSlotProps>(() => audioRef.current);
		if (link) out.link = createNodeFunc<LinkSlotProps>(() => linkRef.current);
		return out;
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
	}, [text, markdown, image, video, audio, link]);

	useLayoutEffect(() => {
		if (!containerRef.current) return;

		viewerRef.current = new JSONCanvasViewer(
			{
				...options,
				attachmentDir,
				attachments,
				canvas,
				container: containerRef.current as unknown as HTMLDivElement,
				nodeComponents,
				theme,
			} as Options<T>,
			modules,
		);

		return () => {
			viewerRef.current?.dispose();
			viewerRef.current = undefined;
			// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
			portalsByIdRef.current.clear();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		viewerRef.current?.changeTheme(theme);
	}, [theme]);

	useEffect(() => {
		viewerRef.current?.load({
			attachmentDir,
			attachments,
			canvas,
		});
	}, [canvas, attachmentDir, attachments]);

	const portals = [...portalsByIdRef.current.values()].map((p) =>
		createPortal(p.element, p.container, p.id),
	);

	return (
		<>
			<section
				ref={(el) => {
					if (el) containerRef.current = el;
				}}
				className={className}
				style={{
					maxHeight: '100vh',
					maxWidth: '100vw',
					...style,
				}}
				dangerouslySetInnerHTML={prerenderHtml ? { __html: prerenderHtml } : undefined}
				suppressHydrationWarning={Boolean(prerenderHtml)}
			/>
			{portals}
		</>
	);
});
