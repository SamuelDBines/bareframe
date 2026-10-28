import { Button, Modal } from '@bareframe/react';

export default function Example() {
  return (
    <Modal
      isOpen
      title="Delete file?"
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </>
      }
    >
      This cannot be undone.
    </Modal>
  );
}
