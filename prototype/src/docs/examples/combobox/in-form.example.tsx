import { useState } from 'react';
import { Combobox } from '@bareframe/react';

const options = [{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }];

export default function Example() {
  const [country, setCountry] = useState('us');
  return (
    <Combobox
      label="Country"
      options={options}
      value={country}
      onChange={setCountry}
    />
  );
}
