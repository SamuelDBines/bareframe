import{n as e,r as t}from"./rolldown-runtime-XKyaHtl9.js";import{B as n,R as r,s as i}from"./component-registry-BqZrIUOo.js";var a=e({default:()=>c}),o=r(),s=[{value:`figma`,label:`Figma`},{value:`sketch`,label:`Sketch`}];function c(){return(0,o.jsx)(i,{label:`Design tool`,options:s,defaultValue:`figma`})}var l=e({default:()=>u}),u=`import { Combobox } from '@bareframe/react';

const options = [
  { value: 'figma', label: 'Figma' },
  { value: 'sketch', label: 'Sketch' },
];

export default function Example() {
  return <Combobox label="Design tool" options={options} defaultValue="figma" />;
}
`,d=e({default:()=>m}),f=t(n(),1),p=[{value:`us`,label:`United States`},{value:`ca`,label:`Canada`}];function m(){let[e,t]=(0,f.useState)(`us`);return(0,o.jsx)(i,{label:`Country`,options:p,value:e,onChange:t})}var h=e({default:()=>g}),g=`import { useState } from 'react';
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
`,_=e({default:()=>v});function v(){return(0,o.jsx)(i,{"aria-label":`Search repositories`,options:[{value:`bareframe`,label:`bareframe`}]})}var y=e({default:()=>b}),b=`import { Combobox } from '@bareframe/react';

export default function Example() {
  return (
    <Combobox
      aria-label="Search repositories"
      options={[{ value: 'bareframe', label: 'bareframe' }]}
    />
  );
}
`;export{l as a,d as i,_ as n,a as o,h as r,y as t};