import { HashRouter, Route, Routes } from 'react-router-dom';
import { DesignerAppShell } from './components/DesignerAppShell';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { AgentSettingsPage } from './pages/designer/AgentSettings';
import { DesignerDashboard } from './pages/designer/Dashboard';
import { DesignerEditor } from './pages/designer/Editor';
import { DesignerLayout } from './pages/designer/DesignerLayout';
import { ExportPage } from './pages/designer/Export';
import { RecordingsPage } from './pages/designer/Recordings';
import { ProjectSettingsPage } from './pages/designer/ProjectSettings';
import { ThemesWorkspace } from './pages/designer/ThemesWorkspace';

export default function DesignerApp() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<HashRouter>
					<Routes>
						<Route element={<DesignerAppShell />}>
							<Route element={<DesignerLayout />}>
								<Route index element={<DesignerDashboard />} />
								<Route path="editor" element={<DesignerEditor />} />
								<Route path="editor/:projectId" element={<DesignerEditor />} />
								<Route path="themes" element={<ThemesWorkspace />} />
								<Route path="theme" element={<ThemesWorkspace />} />
								<Route path="tokens" element={<ThemesWorkspace />} />
								<Route path="export" element={<ExportPage />} />
								<Route path="settings/agent" element={<AgentSettingsPage />} />
								<Route path="settings/project/:projectId" element={<ProjectSettingsPage />} />
								<Route path="recordings/:projectId" element={<RecordingsPage />} />
							</Route>
						</Route>
					</Routes>
				</HashRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}
