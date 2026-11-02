import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicPackage } from '../../designer/packageApi';

export function SharePackagePage() {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchPublicPackage(token).then((res) => {
      setDoc(res.package as Record<string, unknown>);
      setName(res.name);
    });
  }, [token]);

  if (!doc) return <p className="card">Loading shared package…</p>;

  return (
    <div className="page-hero">
      <p className="badge-pill">Shared package (read-only)</p>
      <h1>{name}</h1>
      <p className="lead">{String(doc.summary)}</p>
      <pre className="card" style={{ overflow: 'auto', maxHeight: '60vh', fontSize: '0.75rem' }}>
        {JSON.stringify(doc, null, 2)}
      </pre>
    </div>
  );
}
