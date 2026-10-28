import { Alert, Field } from '@bareframe/react';

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
