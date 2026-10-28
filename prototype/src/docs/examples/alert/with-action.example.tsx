import { Button } from '@bareframe/react';
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
