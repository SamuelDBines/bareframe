import { TOKEN_GROUPS } from '../../data/tokens';

export function TokenEditorPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Token editor</h1>
				<p className="lead">Map semantic tokens to values — synced with tokens.json export.</p>
			</div>
			<div className="designer-split">
				<div className="table-wrap designer-split-main">
					<table className="props-table">
						<thead>
							<tr>
								<th>Token</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{TOKEN_GROUPS.flatMap((g) => g.tokens).map((t) => (
								<tr key={t.name}>
									<td><code>{t.name}</code></td>
									<td>
										<input defaultValue={t.sample} style={{ width: '100%' }} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="card designer-split-preview">
					<h3>Preview</h3>
					<div className="token-swatch" style={{ background: 'var(--bf-theme-surface-1)' }} />
					<div className="token-swatch" style={{ marginTop: '0.5rem', background: 'var(--bf-theme-button-primary-bg)' }} />
				</div>
			</div>
		</>
	);
}
