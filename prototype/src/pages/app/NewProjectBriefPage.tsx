import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppFormActions,
  AppFormPanel,
  AppInlineNotice,
  AppPage,
  AppPageHeader,
  AppTextAreaField,
  Button,
  Field,
} from '../../app/AppUi';
import { createProject } from '../../designer/projectApi';
import { useAuth } from '../../auth/AuthContext';

export function NewProjectBriefPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [audience, setAudience] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status !== 'authenticated') {
      setError('Sign in with GitHub to save projects to your workspace.');
      return;
    }
    const title = name.trim() || summary.trim().split('\n')[0]?.slice(0, 80) || 'Untitled journey';
    setBusy(true);
    try {
      const project = await createProject(title);
      navigate(`/app/project/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppPage narrow>
      <AppPageHeader
        eyebrow="New project"
        title="Start from a short brief"
        lead="Describe the journey you want to map. We open a flow canvas so you can place screens, connectors, and run an AI review when you are ready."
      />

      <AppInlineNotice variant="info" title="AI review">
        You can map flows manually anytime. AI review runs when you click Run review pass on a project — no setup
        required to explore the demo.
      </AppInlineNotice>

      <AppFormPanel title="Project brief">
        <form className="app-form-stack" onSubmit={(e) => void handleSubmit(e)}>
          <Field
            label="Project name"
            hint="e.g. Hookoh onboarding"
            value={name}
            onChange={setName}
            isRequired
          />
          <AppTextAreaField
            label="What journey are you mapping?"
            hint="One or two sentences is enough — you can refine on the canvas."
            rows={4}
            required
            value={summary}
            onChange={setSummary}
            placeholder="Sign-up → first booking → confirmation for a barber shop…"
          />
          <Field
            label="Who is it for?"
            hint="Primary audience"
            value={audience}
            onChange={setAudience}
          />

          {error ? (
            <p className="app-field-error" role="alert">
              {error}
            </p>
          ) : null}

          <AppFormActions>
            <Button variant="primary" type="submit" isDisabled={busy}>
              {busy ? 'Creating…' : 'Create project'}
            </Button>
            <Link to="/app" className="app-link-button">
              Cancel
            </Link>
          </AppFormActions>
        </form>
      </AppFormPanel>

      <p className="app-muted-block">
        Prefer Figma or a live URL?{' '}
        <Link to="/app">Return to the hub</Link> and choose Import from Figma or Import website (Pro).
      </p>
    </AppPage>
  );
}
