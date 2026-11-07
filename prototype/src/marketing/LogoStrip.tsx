/**
 * Social-proof strip. Customer logos go in CUSTOMER_LOGOS once we have permission
 * to show them; until then the strip lists the tools Bareframe actually works with.
 */
const CUSTOMER_LOGOS: { name: string; src: string }[] = [];

const WORKS_WITH = [
	{ name: 'Figma', mark: 'figma' },
	{ name: 'Any live URL', mark: 'url' },
	{ name: 'MCP agents', mark: 'mcp' },
	{ name: 'React components', mark: 'react' },
] as const;

export function LogoStrip() {
	if (CUSTOMER_LOGOS.length > 0) {
		return (
			<section className="logo-strip" aria-label="Teams using Bareframe">
				<div className="bx-container logo-strip__inner">
					<p>Trusted by product teams at</p>
					<ul>
						{CUSTOMER_LOGOS.map((l) => (
							<li key={l.name}>
								<img src={l.src} alt={l.name} height={28} />
							</li>
						))}
					</ul>
				</div>
			</section>
		);
	}

	return (
		<section className="logo-strip" aria-label="Works with">
			<div className="bx-container logo-strip__inner">
				<p>Works with the tools you already use</p>
				<ul>
					{WORKS_WITH.map((w) => (
						<li key={w.name}>
							<span className={`logo-mark logo-mark--${w.mark}`} aria-hidden />
							{w.name}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
