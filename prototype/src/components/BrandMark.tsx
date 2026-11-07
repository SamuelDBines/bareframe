/** Bareframe mark: two screens joined by a connector. */
export function BrandMark() {
	return (
		<span className="brand-mark" aria-hidden>
			<svg viewBox="0 0 18 18" fill="none">
				<rect x="1.5" y="3" width="5.5" height="8" rx="1.6" fill="#fff" />
				<rect x="11" y="7" width="5.5" height="8" rx="1.6" fill="#fff" fillOpacity="0.72" />
				<path d="M7 7h2.2a1.8 1.8 0 0 1 1.8 1.8V11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
			</svg>
		</span>
	);
}
