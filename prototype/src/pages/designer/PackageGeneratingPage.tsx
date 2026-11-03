import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPackageJob, subscribePackageJobEvents } from '../../designer/packageApi';
import { DsCard, DsPage } from '../../designer/DesignerUiPrimitives';
import { designerPath } from '../../sites/urls';

export function PackageGeneratingPage({ appMode }: { appMode?: boolean } = {}) {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [label, setLabel] = useState('Starting…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || jobId === 'demo-job') return;
    let closed = false;

    fetchPackageJob(jobId).then((job) => {
      if (job.status === 'completed' && job.packageId) {
        navigate(
          appMode ? `/app/product/${job.packageId}` : designerPath(`/product/${job.packageId}`),
          { replace: true },
        );
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
        navigate(
          appMode ? `/app/product/${ev.packageId}` : designerPath(`/product/${ev.packageId}`),
          { replace: true },
        );
      }
      if (ev.type === 'failed') setError(String(ev.error ?? 'Failed'));
    });

    return () => {
      closed = true;
      unsub();
    };
  }, [jobId, navigate]);

  return (
    <DsPage>
      <DsCard style={{ maxWidth: 440, margin: '3rem auto', textAlign: 'center' }}>
        <p className="ds-eyebrow" style={{ justifyContent: 'center' }}>
          Generating
        </p>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Building your package</h1>
        {!error ? (
          <>
            <p className="ds-lead" style={{ margin: '0 auto' }}>
              {label}
            </p>
            <p className="ds-meta" style={{ marginTop: '1rem' }}>
              Stages run sequentially with schema validation.
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--bf-theme-danger, #b42318)' }}>{error}</p>
            <Link to={designerPath('/product/new')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Back to intake
            </Link>
          </>
        )}
      </DsCard>
    </DsPage>
  );
}
