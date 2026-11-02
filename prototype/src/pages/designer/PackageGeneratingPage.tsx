import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchPackageJob,
  subscribePackageJobEvents,
} from '../../designer/packageApi';
import { designerPath } from '../../sites/urls';

export function PackageGeneratingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [label, setLabel] = useState('Starting…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let closed = false;

    fetchPackageJob(jobId).then((job) => {
      if (job.status === 'completed' && job.packageId) {
        navigate(designerPath(`/product/${job.packageId}`), { replace: true });
      } else if (job.status === 'failed') {
        setError(job.error ?? 'Generation failed');
      } else if (job.progress?.label) {
        setLabel(String(job.progress.label));
      }
    });

    const unsub = subscribePackageJobEvents(jobId, (ev) => {
      if (closed) return;
      if (ev.type === 'progress' && ev.label) setLabel(String(ev.label));
      if (ev.type === 'completed' && ev.packageId) {
        navigate(designerPath(`/product/${ev.packageId}`), { replace: true });
      }
      if (ev.type === 'failed') setError(String(ev.error ?? 'Failed'));
    });

    return () => {
      closed = true;
      unsub();
    };
  }, [jobId, navigate]);

  return (
    <div className="card" style={{ maxWidth: 480, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Generating your package</h1>
      {!error ? (
        <>
          <p className="lead">{label}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--bf-theme-text-2)' }}>Stages run sequentially with validation.</p>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--bf-theme-danger)' }}>{error}</p>
          <Link to={designerPath('/product/new')} className="btn btn-secondary">
            Back to intake
          </Link>
        </>
      )}
    </div>
  );
}
