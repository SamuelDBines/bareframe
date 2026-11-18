import type { DesignDevice } from '@bareframe/designer-core';
import {
	PROTOTYPE_VIEWPORT_PRESETS,
	type PrototypeViewportKind,
} from '../prototypeDeviceViewport';

/** Design generation uses the same breakpoints as map preview and prototype. */
export function designDeviceToViewport(device: DesignDevice): PrototypeViewportKind {
	return device;
}

export function viewportToDesignDevice(kind: PrototypeViewportKind): DesignDevice {
	return kind;
}

export function mapThumbSizeForDevice(device: DesignDevice): { width: number; height: number; scale: number } {
	const preset = PROTOTYPE_VIEWPORT_PRESETS[device];
	const width = 393;
	const scale = width / preset.width;
	const height = Math.round(preset.height * scale);
	return { width, height, scale };
}