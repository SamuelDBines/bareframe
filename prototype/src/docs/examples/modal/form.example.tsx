import { Field, Modal } from '@bareframe/react';

export default function Example() {
  return (
    <Modal isOpen title="Invite teammate">
      <Field label="Email" />
    </Modal>
  );
}
