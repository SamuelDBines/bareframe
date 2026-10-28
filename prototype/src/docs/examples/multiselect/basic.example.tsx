import { MultiSelect } from '@bareframe/react';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
];

export default function Example() {
  return <MultiSelect label="Skills" options={options} defaultValue={['react']} />;
}
