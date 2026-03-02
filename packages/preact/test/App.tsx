import canvas from '@repo/shared/demo.canvas';
import Viewer from '@/Viewer';

export default function () {
	return (
		<Viewer
			className="canvas-viewer"
			canvas={canvas}
			text={() => <p>this is a Preact component</p>}
		></Viewer>
	);
}
