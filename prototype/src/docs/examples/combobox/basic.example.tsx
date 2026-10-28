import { Combobox } from '@bareframe/react';

const options = [
  { value: 'figma', label: 'Figma' },
  { value: 'sketch', label: 'Sketch' },
];

export default function Example() {
  return <Combobox label="Design tool" options={options} defaultValue="figma" />;
}
