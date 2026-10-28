import{n as e,r as t}from"./rolldown-runtime-XKyaHtl9.js";import{V as n,u as r,z as i}from"./component-registry-Dm2RXy6y.js";var a=e({default:()=>c}),o=i(),s=[{value:`a`,label:`Design`},{value:`b`,label:`Engineering`}];function c(){return(0,o.jsx)(r,{"aria-label":`Team`,options:s,defaultSelectedKey:`a`})}var l=e({default:()=>u}),u=`import { Select } from '@bareframe/react';

const options = [
  { value: 'a', label: 'Design' },
  { value: 'b', label: 'Engineering' },
];

export default function Example() {
  return <Select aria-label="Team" options={options} defaultSelectedKey="a" />;
}
`,d=e({default:()=>m}),f=t(n(),1),p=[{value:`light`,label:`Light`},{value:`dark`,label:`Dark`}];function m(){let[e,t]=(0,f.useState)(`light`);return(0,o.jsx)(r,{"aria-label":`Theme`,options:p,selectedKey:e,onSelectionChange:e=>t(String(e))})}var h=e({default:()=>g}),g=`import { useState } from 'react';
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
`,_=e({default:()=>v});function v(){return(0,o.jsx)(r,{"aria-label":`Plan`,options:[{value:`free`,label:`Free`},{value:`pro`,label:`Pro`,disabled:!0}]})}var y=e({default:()=>b}),b=`import { Select } from '@bareframe/react';

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
`;export{l as a,d as i,_ as n,a as o,h as r,y as t};