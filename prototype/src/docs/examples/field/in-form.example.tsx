import { Field } from '@bareframe/react';

export default function Example() {
  return (
    <Field label="Email" errorMessage="That address is already registered." />
  );
}
