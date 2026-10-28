import{n as e,r as t}from"./rolldown-runtime-XKyaHtl9.js";import{F as n,V as r,_ as i,g as a,z as o}from"./component-registry-deue64KK.js";var s=e({default:()=>u}),c=t(r(),1),l=o();function u(){let[e,t]=(0,c.useState)(!1);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{variant:`destructive`,onPress:()=>t(!0),children:`Delete file…`}),(0,l.jsx)(a,{isOpen:e,onOpenChange:t,isDismissable:!0,title:`Delete file?`,footer:(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{variant:`ghost`,onPress:()=>t(!1),children:`Cancel`}),(0,l.jsx)(n,{variant:`destructive`,onPress:()=>t(!1),children:`Delete`})]}),children:`This cannot be undone.`})]})}var d=e({default:()=>f}),f=`import { useState } from 'react';
import { Button, Modal } from '@bareframe/react';

export default function Example() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="destructive" onPress={() => setOpen(true)}>
				Delete file…
			</Button>
			<Modal
				isOpen={open}
				onOpenChange={setOpen}
				isDismissable
				title="Delete file?"
				footer={
					<>
						<Button variant="ghost" onPress={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onPress={() => setOpen(false)}>
							Delete
						</Button>
					</>
				}
			>
				This cannot be undone.
			</Modal>
		</>
	);
}
`,p=e({default:()=>m});function m(){let[e,t]=(0,c.useState)(!1);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{onPress:()=>t(!0),children:`Open`}),(0,l.jsx)(a,{isOpen:e,onOpenChange:t,title:`Settings`,children:`Modal content`})]})}var h=e({default:()=>g}),g=`import { useState } from 'react';
import { Button, Modal } from '@bareframe/react';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <Modal isOpen={open} onOpenChange={setOpen} title="Settings">
        Modal content
      </Modal>
    </>
  );
}
`,_=e({default:()=>v});function v(){let[e,t]=(0,c.useState)(!1);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n,{onPress:()=>t(!0),children:`Invite teammate`}),(0,l.jsx)(a,{isOpen:e,onOpenChange:t,isDismissable:!0,title:`Invite teammate`,children:(0,l.jsx)(i,{label:`Email`})})]})}var y=e({default:()=>b}),b=`import { useState } from 'react';
import { Button, Field, Modal } from '@bareframe/react';

export default function Example() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onPress={() => setOpen(true)}>Invite teammate</Button>
			<Modal isOpen={open} onOpenChange={setOpen} isDismissable title="Invite teammate">
				<Field label="Email" />
			</Modal>
		</>
	);
}
`;export{d as a,p as i,_ as n,s as o,h as r,y as t};