import { useState } from 'react';
import { Alert } from '@bareframe/react';

export default function DismissibleAlertExample() {
	const [visible, setVisible] = useState(true);
	if (!visible) return <p className="bf-muted">Alert dismissed.</p>;
	return (
		<Alert dismissible title="Heads up" onDismiss={() => setVisible(false)}>
			Your export finished — download it from the dashboard.
		</Alert>
	);
}
