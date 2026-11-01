export type DevicePreset = {
	id: string;
	label: string;
	width: number;
	height: number;
};

export const DEFAULT_DEVICE_PRESETS: DevicePreset[] = [
	{ id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
	{ id: 'iphone-15', label: 'iPhone 15', width: 393, height: 852 },
	{ id: 'mobile', label: 'Mobile', width: 390, height: 844 },
	{ id: 'pixel-8', label: 'Pixel 8', width: 412, height: 915 },
	{ id: 'ipad-mini', label: 'iPad Mini', width: 768, height: 1024 },
	{ id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
	{ id: 'ipad-pro', label: 'iPad Pro 11', width: 834, height: 1194 },
	{ id: 'desktop', label: 'Desktop 1280', width: 1280, height: 800 },
	{ id: 'desktop-1440', label: 'Desktop 1440', width: 1440, height: 900 },
	{ id: 'desktop-1920', label: 'Desktop 1920', width: 1920, height: 1080 },
];

export function getDevicePreset(id: string): DevicePreset | undefined {
	return DEFAULT_DEVICE_PRESETS.find((p) => p.id === id);
}

export function deviceDimensions(
	preset: DevicePreset,
	landscape?: boolean,
): { width: number; height: number } {
	if (!landscape) return { width: preset.width, height: preset.height };
	return { width: preset.height, height: preset.width };
}
