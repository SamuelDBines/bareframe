import { useState } from 'react';
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
