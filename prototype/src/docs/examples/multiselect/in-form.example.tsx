import { useState } from 'react';
import { MultiSelect } from '@bareframe/react';

const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

export default function Example() {
  const [tags, setTags] = useState<string[]>(['a']);
  return <MultiSelect label="Tags" options={options} value={tags} onChange={setTags} />;
}
