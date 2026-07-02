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
	useCallback,
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

type ViewerProps<T extends ModuleInputCtor = ModuleInputCtor> = {
	modules?: T;
	canvas?: JSONCanvas;
	attachments?: Record<string, string>;
	theme?: 'dark' | 'light';
	options?: Omit<Options<T>, 'container' | 'theme' | 'canvas' | 'nodeComponents' | 'attachments'>;
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

const emptyOptions = {} as ViewerProps['options'];

export default forwardRef(
	<T extends ModuleInputCtor>(
		{
			attachments,
			canvas,
			theme,
			modules,
			className,
			style,
			prerenderHtml,
			options = emptyOptions,
			text,
			markdown,
			image,
			video,
			audio,
			link,
		}: ViewerProps<T>,
		ref: React.ForwardedRef<ViewerHandle<T>>,
	) => {
		const containerRef = useRef<HTMLElement | undefined>(undefined);
		const viewerRef = useRef<JSONCanvasViewerInterface<T> | undefined>(undefined);
		const [portalsById, setPortalsById] = useState(() => new Map<string, PortalEntry>());

		const upsertPortal = useCallback(
			(id: string, container: HTMLDivElement, element: ReactNode) => {
				flushSync(() => {
					setPortalsById((current) => {
						const next = new Map(current);
						next.set(id, { container, element, id });
						return next;
					});
				});
			},
			[],
		);

		const removePortalById = useCallback((id: string) => {
			setPortalsById((current) => {
				if (!current.has(id)) return current;
				const next = new Map(current);
				next.delete(id);
				return next;
			});
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				get viewer() {
					return viewerRef.current;
				},
			}),
			[],
		);

		const nodeComponents = useMemo<Options['nodeComponents']>(() => {
			function createNodeFunc<N extends TextSlotProps | FileSlotProps | LinkSlotProps>(
				renderFn: (props: N) => ReactNode,
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
			if (text) out.text = createNodeFunc<TextSlotProps>(text);
			if (markdown) out.markdown = createNodeFunc<FileSlotProps>(markdown);
			if (image) out.image = createNodeFunc<FileSlotProps>(image);
			if (video) out.video = createNodeFunc<FileSlotProps>(video);
			if (audio) out.audio = createNodeFunc<FileSlotProps>(audio);
			if (link) out.link = createNodeFunc<LinkSlotProps>(link);
			return out;
		}, [audio, image, link, markdown, removePortalById, text, upsertPortal, video]);

		useLayoutEffect(() => {
			if (!containerRef.current) return;

			const viewer = new JSONCanvasViewer(
				{
					...options,
					attachments,
					canvas,
					container: containerRef.current,
					nodeComponents,
					theme,
				} as Options<T>,
				modules,
			);
			viewerRef.current = viewer;

			return () => {
				viewer.dispose();
				viewerRef.current = undefined;
				setPortalsById(new Map());
			};
		}, [attachments, canvas, modules, nodeComponents, options, theme]);

		const portals = [...portalsById.values()].map((p) =>
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
	},
);
