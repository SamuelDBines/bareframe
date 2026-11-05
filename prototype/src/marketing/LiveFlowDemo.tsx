import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
	DEMO_CARD,
	DEMO_EDGES,
	DEMO_FINDINGS,
	DEMO_SCREENS,
	DEMO_WORLD,
	MOCK_SIZE,
	type DemoFinding,
	type DemoScreen,
	type MockBlock,
} from './demoFlow';

type Mode = 'map' | 'prototype';

const SEV_LABEL: Record<DemoFinding['severity'], string> = {
	critical: 'Critical',
	major: 'Major',
	minor: 'Minor',
	info: 'Info',
};

function ScreenMock({
	screen,
	fixed,
	onNavigate,
}: {
	screen: DemoScreen;
	fixed: Set<string>;
	onNavigate?: (to: string) => void;
}) {
	const ctaTone = fixed.has('f-landing') ? 'deep' : 'light';
	const visible = (b: MockBlock) => {
		if (b.t === 'helper') return fixed.has(b.fix);
		if (b.t === 'cta' && b.fix) return fixed.has(b.fix);
		return true;
	};

	return (
		<div className="mock" style={{ width: MOCK_SIZE.w, height: MOCK_SIZE.h }}>
			{screen.blocks.filter(visible).map((b, i) => {
				switch (b.t) {
					case 'nav':
						return (
							<div key={i} className="mock-nav">
								<span className="mock-logo" />
								<span className="mock-nav-dots">
									<i />
									<i />
								</span>
							</div>
						);
					case 'title':
						return (
							<p key={i} className="mock-title">
								{b.text}
							</p>
						);
					case 'text':
						return (
							<p key={i} className="mock-text">
								{b.text}
							</p>
						);
					case 'input':
						return (
							<div key={i} className="mock-input">
								<span>{b.label}</span>
							</div>
						);
					case 'helper':
						return (
							<p key={i} className="mock-helper bx-reveal">
								✓ {b.text}
							</p>
						);
					case 'plans':
						return (
							<div key={i} className="mock-plans">
								<span>Free</span>
								<span className="is-on">Pro</span>
							</div>
						);
					case 'tiles':
						return (
							<div key={i} className="mock-tiles">
								<i />
								<i />
							</div>
						);
					case 'icon':
						return <span key={i} className={`mock-icon mock-icon--${b.tone}`} aria-hidden />;
					case 'cta': {
						const cls = `mock-cta${b.secondary ? ' mock-cta--secondary' : ''}${
							screen.id === 'landing' && !b.secondary ? ` mock-cta--${ctaTone}` : ''
						}${b.fix ? ' bx-reveal' : ''}`;
						if (onNavigate && b.to) {
							return (
								<button key={i} type="button" className={`${cls} mock-cta--hot`} onClick={() => onNavigate(b.to!)}>
									{b.label}
								</button>
							);
						}
						return (
							<span key={i} className={cls}>
								{b.label}
							</span>
						);
					}
				}
			})}
		</div>
	);
}

function edgeGeometry(from: DemoScreen, to: DemoScreen) {
	const midY = DEMO_CARD.h / 2;
	const x1 = from.x + DEMO_CARD.w;
	const y1 = from.y + midY;
	const x2 = to.x;
	const y2 = to.y + midY;
	const dx = Math.max(40, (x2 - x1) * 0.5);
	const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2 - 6} ${y2}`;
	return { d, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

export function LiveFlowDemo() {
	const [mode, setMode] = useState<Mode>('map');
	const [fixed, setFixed] = useState<Set<string>>(() => new Set());
	const [activeId, setActiveId] = useState<string>(DEMO_FINDINGS[0]!.id);
	const [scanning, setScanning] = useState(false);
	const [protoScreen, setProtoScreen] = useState('landing');
	const [history, setHistory] = useState<string[]>([]);
	const [scale, setScale] = useState(0.8);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const stageRef = useRef<HTMLDivElement>(null);
	const announceRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const s = Math.min((el.clientWidth - 24) / DEMO_WORLD.w, (el.clientHeight - 24) / DEMO_WORLD.h);
			setScale(Math.max(0.4, Math.min(1, s)));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const screens = useMemo(
		() => DEMO_SCREENS.filter((s) => !s.addedBy || fixed.has(s.addedBy)),
		[fixed],
	);
	const edges = useMemo(() => DEMO_EDGES.filter((e) => !e.addedBy || fixed.has(e.addedBy)), [fixed]);
	const open = DEMO_FINDINGS.filter((f) => !fixed.has(f.id));
	const active = DEMO_FINDINGS.find((f) => f.id === activeId) ?? null;

	const announce = (msg: string) => {
		if (announceRef.current) announceRef.current.textContent = msg;
	};

	const applyFix = useCallback(
		(f: DemoFinding) => {
			setFixed((prev) => new Set(prev).add(f.id));
			announce(`Fixed: ${f.title}`);
			const next = DEMO_FINDINGS.find((x) => x.id !== f.id && !fixed.has(x.id));
			if (next) window.setTimeout(() => setActiveId(next.id), 650);
		},
		[fixed],
	);

	const rerun = () => {
		setScanning(true);
		setFixed(new Set());
		setActiveId(DEMO_FINDINGS[0]!.id);
		announce('Review re-run: 4 findings');
		window.setTimeout(() => setScanning(false), 1300);
	};

	const startPan = (e: React.PointerEvent) => {
		if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
		const start = { x: e.clientX, y: e.clientY, pan };
		const move = (ev: PointerEvent) =>
			setPan({
				x: Math.max(-240, Math.min(240, start.pan.x + ev.clientX - start.x)),
				y: Math.max(-160, Math.min(160, start.pan.y + ev.clientY - start.y)),
			});
		const up = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	};

	const goTo = (to: string) => {
		setHistory((h) => [...h, protoScreen]);
		setProtoScreen(to);
	};

	const protoCurrent = DEMO_SCREENS.find((s) => s.id === protoScreen) ?? DEMO_SCREENS[0]!;

	const worldStyle: CSSProperties = {
		width: DEMO_WORLD.w,
		height: DEMO_WORLD.h,
		transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
	};

	return (
		<div className="live-demo" data-testid="live-flow-demo">
			<div className="live-demo__bar">
				<span className="live-demo__dots" aria-hidden>
					<i />
					<i />
					<i />
				</span>
				<div className="live-demo__title">
					<strong>Budgetly — sign-up &amp; upgrade</strong>
					<span className="bx-chip">Sample project</span>
				</div>
				<div className="live-demo__modes" role="tablist" aria-label="Demo view">
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'map'}
						onClick={() => setMode('map')}
					>
						Flow map
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'prototype'}
						onClick={() => {
							setMode('prototype');
							setProtoScreen('landing');
							setHistory([]);
						}}
					>
						Prototype
					</button>
				</div>
			</div>

			<div className="live-demo__body">
				{mode === 'map' ? (
					<div
						ref={stageRef}
						className={`live-demo__stage${scanning ? ' is-scanning' : ''}`}
						onPointerDown={startPan}
						role="group"
						aria-label="Sample flow map. Drag to pan; use the flags to see AI findings."
					>
						<div className="live-demo__world" style={worldStyle}>
							<svg className="live-demo__edges" width={DEMO_WORLD.w} height={DEMO_WORLD.h} aria-hidden>
								<defs>
									<marker id="ld-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
										<path d="M0 0 L10 5 L0 10 z" fill="var(--bx-accent)" />
									</marker>
								</defs>
								{edges.map((e) => {
									const from = screens.find((s) => s.id === e.from);
									const to = screens.find((s) => s.id === e.to);
									if (!from || !to) return null;
									const g = edgeGeometry(from, to);
									const w = e.label.length * 6.4 + 22;
									return (
										<g key={e.id} className={e.addedBy ? 'ld-edge-new' : undefined}>
											<path d={g.d} className="ld-edge" markerEnd="url(#ld-arrow)" />
											<rect x={g.mx - w / 2} y={g.my - 11} width={w} height={22} rx={11} className="ld-pill" />
											<text x={g.mx} y={g.my + 4} className="ld-pill-text">
												{e.label}
											</text>
										</g>
									);
								})}
							</svg>
							{screens.map((s) => {
								const flags = DEMO_FINDINGS.filter((f) => f.screenId === s.id);
								const isActive = active?.screenId === s.id;
								return (
									<div
										key={s.id}
										className={`ld-card${isActive ? ' is-active' : ''}${s.addedBy ? ' ld-card--new' : ''}`}
										style={{ left: s.x, top: s.y, width: DEMO_CARD.w }}
									>
										<div className="ld-card__thumb" style={{ height: DEMO_CARD.h }}>
											<div style={{ transform: `scale(${DEMO_CARD.w / MOCK_SIZE.w})`, transformOrigin: '0 0' }}>
												<ScreenMock screen={s} fixed={fixed} />
											</div>
										</div>
										<span className="ld-card__name">{s.name}</span>
										{flags.map((f) => {
											const done = fixed.has(f.id);
											return (
												<button
													key={f.id}
													type="button"
													className={`ld-flag ld-flag--${done ? 'ok' : f.severity}${activeId === f.id ? ' is-active' : ''}`}
													aria-label={`${done ? 'Fixed' : SEV_LABEL[f.severity]}: ${f.title}`}
													aria-pressed={activeId === f.id}
													onClick={() => setActiveId(f.id)}
												>
													{done ? '✓' : '!'}
												</button>
											);
										})}
									</div>
								);
							})}
						</div>
						<p className="live-demo__hint" aria-hidden>
							Drag to pan · click a flag
						</p>
					</div>
				) : (
					<div className="live-demo__proto" data-testid="live-demo-prototype">
						<div className="ld-phone">
							<div className="ld-phone__screen">
								<div style={{ transform: 'scale(1.12)', transformOrigin: '0 0' }}>
									<ScreenMock screen={protoCurrent} fixed={fixed} onNavigate={goTo} />
								</div>
							</div>
						</div>
						<div className="live-demo__proto-side">
							<p className="bx-kicker">Click-through prototype</p>
							<h3>{protoCurrent.name}</h3>
							<p>Tap the highlighted buttons on the phone. Every hotspot comes from a connector on the map.</p>
							<div className="live-demo__proto-actions">
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									disabled={history.length === 0}
									onClick={() => {
										setProtoScreen(history[history.length - 1] ?? 'landing');
										setHistory((h) => h.slice(0, -1));
									}}
								>
									← Back
								</button>
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={() => {
										setProtoScreen('landing');
										setHistory([]);
									}}
								>
									Restart
								</button>
							</div>
							<div className="ld-share">
								<span aria-hidden>🔗</span>
								<code>bareframe.org/share/budgetly</code>
							</div>
						</div>
					</div>
				)}

				<aside className="live-demo__panel" aria-label="AI findings">
					<div className="live-demo__panel-head">
						<div>
							<strong>AI review</strong>
							<span className="ld-count">
								{open.length === 0 ? 'All clear' : `${open.length} open`}
							</span>
						</div>
						<button type="button" className="btn btn-ghost btn-sm" onClick={rerun}>
							Re-run
						</button>
					</div>
					<ul className="ld-findings">
						{DEMO_FINDINGS.map((f) => {
							const done = fixed.has(f.id);
							const isActive = activeId === f.id;
							return (
								<li key={f.id} className={`ld-finding${isActive ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
									<button
										type="button"
										className="ld-finding__head"
										aria-expanded={isActive}
										onClick={() => {
											setActiveId(f.id);
											if (mode !== 'map') setMode('map');
										}}
									>
										<span className={`bx-sev bx-sev--${done ? 'ok' : f.severity}`}>
											{done ? 'Fixed' : SEV_LABEL[f.severity]}
										</span>
										<span className="ld-finding__title">{f.title}</span>
									</button>
									{isActive ? (
										<div className="ld-finding__body bx-reveal">
											<p className="ld-finding__meta">
												{f.category} · {DEMO_SCREENS.find((s) => s.id === f.screenId)?.name}
											</p>
											<p>{f.detail}</p>
											<p className="ld-finding__fix">
												<strong>Suggested fix</strong>
												{f.fix}
											</p>
											{done ? (
												<span className="ld-finding__done">Applied to the map</span>
											) : (
												<button type="button" className="btn btn-primary btn-sm" onClick={() => applyFix(f)}>
													{f.applyLabel}
												</button>
											)}
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				</aside>
			</div>
			<p ref={announceRef} className="bx-visually-hidden" aria-live="polite" />
		</div>
	);
}
