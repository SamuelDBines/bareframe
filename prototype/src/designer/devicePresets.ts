import type { DevicePreset } from './types';

export const DEFAULT_DEVICE_PRESETS: DevicePreset[] = [
	{ id: 'iphone-se', label: 'iPhone SE 375×667', width: 375, height: 667, category: 'phone', breakpointId: 'base' },
	{ id: 'iphone-15', label: 'iPhone 15 393×852', width: 393, height: 852, category: 'phone', breakpointId: 'base' },
	{ id: 'mobile', label: 'Mobile 390×844', width: 390, height: 844, category: 'phone', breakpointId: 'base' },
	{ id: 'pixel-8', label: 'Pixel 8 412×915', width: 412, height: 915, category: 'phone', breakpointId: 'base' },
	{ id: 'ipad-mini', label: 'iPad Mini 768×1024', width: 768, height: 1024, category: 'tablet', breakpointId: 'md' },
	{ id: 'tablet', label: 'Tablet 768×1024', width: 768, height: 1024, category: 'tablet', breakpointId: 'md' },
	{ id: 'ipad-pro', label: 'iPad Pro 11 834×1194', width: 834, height: 1194, category: 'tablet', breakpointId: 'md' },
	{ id: 'desktop', label: 'Desktop 1280×800', width: 1280, height: 800, category: 'desktop', breakpointId: 'lg' },
	{ id: 'desktop-1440', label: 'Desktop 1440×900', width: 1440, height: 900, category: 'desktop', breakpointId: 'xl' },
	{ id: 'desktop-1920', label: 'Desktop 1920×1080', width: 1920, height: 1080, category: 'desktop', breakpointId: 'xl' },
];

export const DUPLICATE_TO_DEVICES_DEFAULT = ['iphone-15', 'ipad-mini', 'desktop-1440'];

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
