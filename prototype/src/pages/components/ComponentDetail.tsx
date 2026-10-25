import { Link, useParams } from 'react-router-dom';
import { getComponent } from '../../data/components';

function PreviewMock({ slug }: { slug: string }) {
	if (slug === 'button') {
		return (
			<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
				<button type="button" className="btn btn-primary">Primary</button>
				<button type="button" className="btn btn-secondary">Secondary</button>
				<button type="button" className="btn btn-ghost">Ghost</button>
			</div>
		);
	}
	if (slug === 'alert') {
		return (
			<div
				className="card"
				style={{
					borderColor: 'var(--bf-theme-button-primary-border-color)',
					background: 'color-mix(in srgb, var(--bf-theme-button-primary-bg) 8%, var(--bf-theme-surface-1))',
				}}
			>
				<strong>Heads up</strong>
				<p style={{ margin: '0.35rem 0 0' }}>Your theme variables drive alert surfaces too.</p>
			</div>
		);
	}
	return (
		<div
			className="card"
			style={{
				minHeight: 120,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: 'var(--bf-theme-text-2)',
			}}
		>
			Interactive preview placeholder for {slug}
		</div>
	);
}

export function ComponentDetailPage() {
	const { slug = '' } = useParams();
	const doc = getComponent(slug);

	if (!doc) {
		return (
			<div className="card">
				<h2>Component not found</h2>
				<Link to="/components">← Back to gallery</Link>
			</div>
		);
	}

	const snippet = `import { ${doc.name} } from '@bareframe/react';

export function Example() {
  return (
    <${doc.name} variant="${doc.variants[0] ?? 'default'}">
      ${doc.name} content
    </${doc.name}>
  );
}`;

	return (
		<>
			<p>
				<Link to="/components">← Gallery</Link>
			</p>
			<div className="page-hero">
				<h1>{doc.name}</h1>
				<p className="lead">{doc.description}</p>
				<span className={`badge-pill ${doc.status === 'stable' ? 'success' : doc.status}`}>
					{doc.status}
				</span>
			</div>

			<section style={{ marginBottom: '1.5rem' }}>
				<h2>Preview</h2>
				<div className="card" style={{ marginTop: '0.75rem' }}>
					<PreviewMock slug={slug} />
				</div>
			</section>

			<section style={{ marginBottom: '1.5rem' }}>
				<h2>Variants</h2>
				<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
					{doc.variants.map((v) => (
						<span key={v} className="badge-pill">{v}</span>
					))}
				</div>
			</section>

			<section style={{ marginBottom: '1.5rem' }}>
				<h2>Props</h2>
				<div className="table-wrap" style={{ marginTop: '0.75rem' }}>
					<table className="props-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Default</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{doc.props.map((p) => (
								<tr key={p.name}>
									<td><code>{p.name}</code></td>
									<td><code>{p.type}</code></td>
									<td>{p.default ?? '—'}</td>
									<td>{p.description}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<h2>Code</h2>
				<pre className="code-block">{snippet}</pre>
			</section>
		</>
	);
}
