import { useState } from 'react';
import { Button, Modal } from '@bareframe/react';

export default function Example() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <Modal isOpen={open} onOpenChange={setOpen} title="Settings">
        Modal content
      </Modal>
    </>
  );
}
