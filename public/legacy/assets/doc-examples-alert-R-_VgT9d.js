import{n as e,r as t}from"./rolldown-runtime-XKyaHtl9.js";import{B as n,L as r,P as i,R as a,g as o}from"./component-registry-BqZrIUOo.js";var s=e({default:()=>u}),c=t(n(),1),l=a();function u(){let[e,t]=(0,c.useState)(!0);return e?(0,l.jsx)(r,{dismissible:!0,title:`Heads up`,onDismiss:()=>t(!1),children:`Your export finished — download it from the dashboard.`}):(0,l.jsx)(`p`,{className:`bf-muted`,children:`Alert dismissed.`})}var d=e({default:()=>f}),f=`import { useState } from 'react';
import { Alert } from '@bareframe/react';

export default function DismissibleAlertExample() {
	const [visible, setVisible] = useState(true);
	if (!visible) return <p className="bf-muted">Alert dismissed.</p>;
	return (
		<Alert dismissible title="Heads up" onDismiss={() => setVisible(false)}>
			Your export finished — download it from the dashboard.
		</Alert>
	);
}
`,p=e({default:()=>m});function m(){return(0,l.jsxs)(`form`,{className:`form-stack`,onSubmit:e=>e.preventDefault(),children:[(0,l.jsx)(o,{label:`Work email`,errorMessage:`Enter a valid company email.`,defaultValue:`not-an-email`}),(0,l.jsx)(r,{variant:`error`,title:`Could not save`,children:`Fix the highlighted fields and try again.`})]})}var h=e({default:()=>g}),g=`import { Alert, Field } from '@bareframe/react';

export default function AlertFormErrorExample() {
	return (
		<form className="form-stack" onSubmit={(e) => e.preventDefault()}>
			<Field label="Work email" errorMessage="Enter a valid company email." defaultValue="not-an-email" />
			<Alert variant="error" title="Could not save">
				Fix the highlighted fields and try again.
			</Alert>
		</form>
	);
}
`,_=e({default:()=>v});function v(){return(0,l.jsxs)(`div`,{className:`form-stack`,style:{maxWidth:`28rem`},children:[(0,l.jsx)(r,{variant:`success`,title:`Payment received`,children:`Invoice #1042 is paid in full.`}),(0,l.jsx)(r,{variant:`info`,title:`Receipt emailed`,children:`We sent a copy to billing@example.com.`})]})}var y=e({default:()=>b}),b=`import { Alert } from '@bareframe/react';

export default function AlertStackExample() {
	return (
		<div className="form-stack" style={{ maxWidth: '28rem' }}>
			<Alert variant="success" title="Payment received">
				Invoice #1042 is paid in full.
			</Alert>
			<Alert variant="info" title="Receipt emailed">
				We sent a copy to billing@example.com.
			</Alert>
		</div>
	);
}
`,x=e({default:()=>S});function S(){return(0,l.jsx)(r,{variant:`warning`,title:`Session expiring`,action:(0,l.jsx)(i,{size:`sm`,variant:`secondary`,children:`Extend session`}),children:`You will be signed out in 5 minutes.`})}var C=e({default:()=>w}),w=`import { Button } from '@bareframe/react';
import { Alert } from '@bareframe/react';

export default function AlertWithActionExample() {
	return (
		<Alert
			variant="warning"
			title="Session expiring"
			action={
				<Button size="sm" variant="secondary">
					Extend session
				</Button>
			}
		>
			You will be signed out in 5 minutes.
		</Alert>
	);
}
`;export{h as a,s as c,_ as i,x as n,p as o,y as r,d as s,C as t};