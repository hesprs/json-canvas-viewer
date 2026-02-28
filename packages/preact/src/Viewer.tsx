import type { ComponentChildren } from 'preact';
import {
	JSONCanvasViewer,
	type Options,
	type JSONCanvasViewerInterface,
	type GeneralModuleCtor,
	type Hook,
	type JSONCanvasTextNode,
	type JSONCanvasLinkNode,
	type JSONCanvasFileNode,
	type JSONCanvas,
} from 'json-canvas-viewer';
import { forwardRef, type ForwardedRef, createPortal, flushSync } from 'preact/compat';
import {
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

type ModuleInputCtor = Array<GeneralModuleCtor>;

interface TextSlotProps {
	content: string;
	node: JSONCanvasTextNode;
	onActive: Hook;
	onLoseActive: Hook;
}

interface LinkSlotProps {
	content: string;
	node: JSONCanvasLinkNode;
	onActive: Hook;
	onLoseActive: Hook;
}

interface FileSlotProps {
	content: string;
	node: JSONCanvasFileNode;
	onActive: Hook;
	onLoseActive: Hook;
}

type ViewerHandle<T extends ModuleInputCtor> = {
	viewer: JSONCanvasViewerInterface<T> | null;
};

type ViewerProps<T extends ModuleInputCtor = ModuleInputCtor> = {
	modules?: T;
	canvas?: JSONCanvas;
	attachmentDir?: string;
	attachments?: Record<string, string>;
	theme?: 'dark' | 'light';
	options?: Omit<
		Options<T>,
		'container' | 'theme' | 'canvas' | 'attachmentDir' | 'nodeComponents' | 'attachments'
	>;
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

function useLatest<T>(value: T) {
	const ref = useRef(value);
	ref.current = value;
	return ref;
}

export default forwardRef(function ViewerInner<T extends ModuleInputCtor>(
	props: ViewerProps<T>,
	ref: ForwardedRef<ViewerHandle<T>>,
) {
	const containerRef = useRef<HTMLElement | null>(null);
	const viewerRef = useRef<JSONCanvasViewerInterface<T> | null>(null);
	const textRef = useLatest(props.text);
	const markdownRef = useLatest(props.markdown);
	const imageRef = useLatest(props.image);
	const videoRef = useLatest(props.video);
	const audioRef = useLatest(props.audio);
	const linkRef = useLatest(props.link);
	const portalsByIdRef = useRef(new Map<string, PortalEntry>());
	const [, forceRender] = useState(0);

	function upsertPortal(id: string, container: HTMLDivElement, element: ComponentChildren) {
		portalsByIdRef.current.set(id, { id, container, element });
		flushSync(() => forceRender((x) => x + 1));
	}

	function removePortalById(id: string) {
		portalsByIdRef.current.delete(id);
	}

	useImperativeHandle(ref, () => ({ viewer: viewerRef.current }), []);

	const nodeComponents = useMemo<Options['nodeComponents']>(() => {
		function createNodeFunc<N extends TextSlotProps | FileSlotProps | LinkSlotProps>(
			getRenderFn: () => ((props: N) => ComponentChildren) | undefined,
		) {
			return (
				container: HTMLDivElement,
				content: string,
				node: N['node'],
				onBeforeUnmount: Hook,
				onActive: Hook,
				onLoseActive: Hook,
			) => {
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
		if (props.text) out.text = createNodeFunc<TextSlotProps>(() => textRef.current);
		if (props.markdown) out.markdown = createNodeFunc<FileSlotProps>(() => markdownRef.current);
		if (props.image) out.image = createNodeFunc<FileSlotProps>(() => imageRef.current);
		if (props.video) out.video = createNodeFunc<FileSlotProps>(() => videoRef.current);
		if (props.audio) out.audio = createNodeFunc<FileSlotProps>(() => audioRef.current);
		if (props.link) out.link = createNodeFunc<LinkSlotProps>(() => linkRef.current);
		return out;
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
	}, [props.text, props.markdown, props.image, props.video, props.audio, props.link]);

	useLayoutEffect(() => {
		if (!containerRef.current) return;

		viewerRef.current = new JSONCanvasViewer(
			{
				...(props.options ?? ({} as ViewerProps<T>['options'])),
				container: containerRef.current as unknown as HTMLDivElement,
				theme: props.theme,
				canvas: props.canvas,
				attachmentDir: props.attachmentDir,
				attachments: props.attachments,
				nodeComponents,
			} as Options<T>,
			props.modules,
		);

		return () => {
			viewerRef.current?.dispose();
			viewerRef.current = null;
			// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
			portalsByIdRef.current.clear();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		viewerRef.current?.changeTheme(props.theme);
	}, [props.theme]);

	useEffect(() => {
		viewerRef.current?.load({
			canvas: props.canvas,
			attachmentDir: props.attachmentDir,
			attachments: props.attachments,
		});
	}, [props.canvas, props.attachmentDir, props.attachments]);

	const portals = Array.from(portalsByIdRef.current.values()).map((p) =>
		createPortal(p.element, p.container),
	);

	return (
		<>
			<section
				ref={(el) => {
					containerRef.current = el;
				}}
				className={props.className}
				style={{
					maxHeight: '100vh',
					maxWidth: '100vw',
					// oxlint-disable-next-line typescript/no-misused-spread
					...props.style,
				}}
				dangerouslySetInnerHTML={
					props.prerenderHtml ? { __html: props.prerenderHtml } : undefined
				}
			/>
			{portals}
		</>
	);
});
