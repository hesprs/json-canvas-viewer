import canvas from 'shared/demo.canvas';
import Viewer from '@/Viewer';

export default function () {
	return (
		<Viewer
			className="canvas-viewer"
			canvas={canvas}
			text={() => <p>this is a React component</p>}
		></Viewer>
	);
}
