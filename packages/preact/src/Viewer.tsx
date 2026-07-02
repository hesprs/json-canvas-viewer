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
import type { ComponentChildren } from 'preact';
import type { ForwardedRef } from 'preact/compat';
import { JSONCanvasViewer } from 'json-canvas-viewer';
import { forwardRef, createPortal, flushSync } from 'preact/compat';
import {
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

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
	text?: (props: TextSlotProps) => ComponentChildren;
	markdown?: (props: FileSlotProps) => ComponentChildren;
	image?: (props: FileSlotProps) => ComponentChildren;
	video?: (props: FileSlotProps) => ComponentChildren;
	audio?: (props: FileSlotProps) => ComponentChildren;
	link?: (props: LinkSlotProps) => ComponentChildren;
	prerenderHtml?: string;
	className?: string;
	style?: preact.CSSProperties;
};

type PortalEntry = {
	id: string;
	container: HTMLDivElement;
	element: ComponentChildren;
};

const emptyOptions = {} as ViewerProps['options'];

export default forwardRef(
	<T extends ModuleInputCtor>(
		{
			text,
			markdown,
			image,
			video,
			audio,
			link,
			options = emptyOptions,
			attachments,
			canvas,
			theme,
			modules,
			className,
			style,
			prerenderHtml,
		}: ViewerProps<T>,
		ref: ForwardedRef<ViewerHandle<T>>,
	) => {
		const containerRef = useRef<HTMLElement | undefined>();
		const viewerRef = useRef<JSONCanvasViewerInterface<T> | undefined>();
		const [portalsById, setPortalsById] = useState(() => new Map<string, PortalEntry>());

		const upsertPortal = useCallback(
			(id: string, container: HTMLDivElement, element: ComponentChildren) => {
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
				renderFn: (props: N) => ComponentChildren,
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

		const portals = [...portalsById.values()].map((p) => createPortal(p.element, p.container));

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
						// oxlint-disable-next-line typescript/no-misused-spread
						...style,
					}}
					dangerouslySetInnerHTML={prerenderHtml ? { __html: prerenderHtml } : undefined}
				/>
				{portals}
			</>
		);
	},
);
