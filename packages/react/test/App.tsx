import canvas from '@repo/shared/demo.canvas';
import Viewer from '@/Viewer';

export default function render() {
	return (
		<Viewer
			className="canvas-viewer"
			canvas={canvas}
			text={() => <p>this is a React component</p>}
		/>
	);
}
