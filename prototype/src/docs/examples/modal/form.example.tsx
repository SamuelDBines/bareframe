import { useState } from 'react';
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
