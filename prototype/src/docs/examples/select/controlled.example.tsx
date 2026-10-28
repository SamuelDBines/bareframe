import { useState } from 'react';
import { Select } from '@bareframe/react';

const options = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }];

export default function Example() {
  const [theme, setTheme] = useState('light');
  return (
    <Select
      aria-label="Theme"
      options={options}
      selectedKey={theme}
      onSelectionChange={(k) => setTheme(String(k))}
    />
  );
}
