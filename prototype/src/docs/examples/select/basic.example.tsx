import { Select } from '@bareframe/react';

const options = [
  { value: 'a', label: 'Design' },
  { value: 'b', label: 'Engineering' },
];

export default function Example() {
  return <Select aria-label="Team" options={options} defaultSelectedKey="a" />;
}
