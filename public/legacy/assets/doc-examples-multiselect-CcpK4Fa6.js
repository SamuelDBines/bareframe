import{n as e,r as t}from"./rolldown-runtime-XKyaHtl9.js";import{B as n,R as r,c as i}from"./component-registry-CQJeD15z.js";var a=e({default:()=>c}),o=r(),s=[{value:`react`,label:`React`},{value:`vue`,label:`Vue`}];function c(){return(0,o.jsx)(i,{label:`Skills`,options:s,defaultValue:[`react`]})}var l=e({default:()=>u}),u=`import { MultiSelect } from '@bareframe/react';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
];

export default function Example() {
  return <MultiSelect label="Skills" options={options} defaultValue={['react']} />;
}
`,d=e({default:()=>m}),f=t(n(),1),p=[{value:`a`,label:`Alpha`},{value:`b`,label:`Beta`}];function m(){let[e,t]=(0,f.useState)([`a`]);return(0,o.jsx)(i,{label:`Tags`,options:p,value:e,onChange:t})}var h=e({default:()=>g}),g=`import { useState } from 'react';
import { MultiSelect } from '@bareframe/react';

const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

export default function Example() {
  const [tags, setTags] = useState<string[]>(['a']);
  return <MultiSelect label="Tags" options={options} value={tags} onChange={setTags} />;
}
`,_=e({default:()=>v});function v(){return(0,o.jsx)(`div`,{style:{maxWidth:`16rem`},children:(0,o.jsx)(i,{"aria-label":`Labels`,options:[{value:`bug`,label:`Bug`}]})})}var y=e({default:()=>b}),b=`import { MultiSelect } from '@bareframe/react';

export default function Example() {
  return (
    <div style={{ maxWidth: '16rem' }}>
      <MultiSelect aria-label="Labels" options={[{ value: 'bug', label: 'Bug' }]} />
    </div>
  );
}
`;export{l as a,d as i,_ as n,a as o,h as r,y as t};