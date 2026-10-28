import { Combobox } from '@bareframe/react';

export default function Example() {
  return (
    <Combobox
      aria-label="Search repositories"
      options={[{ value: 'bareframe', label: 'bareframe' }]}
    />
  );
}
