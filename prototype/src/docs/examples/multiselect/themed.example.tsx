import { MultiSelect } from '@bareframe/react';

export default function Example() {
  return (
    <div style={{ maxWidth: '16rem' }}>
      <MultiSelect aria-label="Labels" options={[{ value: 'bug', label: 'Bug' }]} />
    </div>
  );
}
