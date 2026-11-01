import { useParams } from 'react-router-dom';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';

export function DesignerEditor() {
	const { projectId } = useParams<{ projectId?: string }>();
	return <DesignerWorkspace projectId={projectId} />;
}
