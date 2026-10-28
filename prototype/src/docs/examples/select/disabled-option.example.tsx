import { Select } from '@bareframe/react';

export default function Example() {
  return (
    <Select
      aria-label="Plan"
      options={[
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro', disabled: true },
      ]}
    />
  );
}
