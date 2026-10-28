import { Alert } from '@bareframe/react';

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
