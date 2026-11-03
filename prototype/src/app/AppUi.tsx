import type { ReactNode } from 'react';
import { Alert, type AlertVariant, Button, Card, Field } from '@bareframe/react';
import { Textarea } from '@bareframe/react';

export function AppPage({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`app-page${narrow ? ' app-page--narrow' : ''}`}>{children}</div>;
}

export function AppPageHeader({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="app-page-header">
      <div className="app-page-header__copy">
        {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="app-lead">{lead}</p> : null}
      </div>
      {actions ? <div className="app-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function AppInlineNotice({
  variant = 'info',
  title,
  children,
  action,
}: {
  variant?: AlertVariant;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Alert variant={variant} title={title} className="app-inline-notice" action={action}>
      {children}
    </Alert>
  );
}

export function AppFormPanel({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Card variant="elevated" title={title} className="app-form-panel">
      {children}
    </Card>
  );
}

export function AppTextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  required,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="bf-field app-textarea-field">
      <span className="bf-field__label">{label}</span>
      <Textarea
        className="bf-textarea app-textarea-field__control"
        rows={rows}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="bf-field__hint">{hint}</span> : null}
    </label>
  );
}

export function AppTextField({
  label,
  placeholder,
  hint,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="bf-field app-text-field">
      <span className="bf-field__label">{label}</span>
      <input
        className="bf-input app-text-field__control"
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="bf-field__hint">{hint}</span> : null}
    </label>
  );
}

export function AppFormActions({ children }: { children: ReactNode }) {
  return <div className="app-form-actions">{children}</div>;
}

export function AppSubmitButton({
  children,
  isDisabled,
  loading,
}: {
  children: ReactNode;
  isDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button variant="primary" type="submit" className="app-submit-primary" isDisabled={isDisabled} loading={loading}>
      {children}
    </Button>
  );
}

export { Button, Card, Field };
