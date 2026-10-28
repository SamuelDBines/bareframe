import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
const ComponentDetailPage = lazy(() =>
	import('./pages/components/ComponentDetail').then((m) => ({ default: m.ComponentDetailPage })),
);
import { ComponentsGallery } from './pages/components/ComponentsGallery';
import { ComponentsLayout } from './pages/components/ComponentsLayout';
import { GettingStartedPage } from './pages/components/GettingStartedPage';
import { McpPage } from './pages/components/McpPage';
import { TokensPage } from './pages/components/TokensPage';
import { AgentSettingsPage } from './pages/designer/AgentSettings';
import { DesignerDashboard } from './pages/designer/Dashboard';
import { DesignerEditor } from './pages/designer/Editor';
import { DesignerLayout } from './pages/designer/DesignerLayout';
import { ExportPage } from './pages/designer/Export';
import { ThemesWorkspace } from './pages/designer/ThemesWorkspace';
import { LandingPage } from './pages/site/Landing';
import { PricingPage } from './pages/site/Pricing';
import { SignInPage } from './pages/site/SignIn';
import { SignUpPage } from './pages/site/SignUp';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';

export default function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
			<HashRouter>
				<Routes>
					<Route element={<AppShell />}>
						<Route index element={<LandingPage />} />
						<Route path="pricing" element={<PricingPage />} />
						<Route path="sign-up" element={<SignUpPage />} />
						<Route path="sign-in" element={<SignInPage />} />

						<Route path="components" element={<ComponentsLayout />}>
							<Route index element={<ComponentsGallery />} />
							<Route path="tokens" element={<TokensPage />} />
							<Route path="mcp" element={<McpPage />} />
							<Route path="start" element={<GettingStartedPage />} />
							<Route path=":slug" element={
								<Suspense fallback={<p className="card">Loading component docs…</p>}>
									<ComponentDetailPage />
								</Suspense>
							} />
						</Route>

						<Route path="designer" element={<DesignerLayout />}>
							<Route index element={<DesignerDashboard />} />
							<Route path="editor" element={<DesignerEditor />} />
							<Route path="themes" element={<ThemesWorkspace />} />
							<Route path="theme" element={<ThemesWorkspace />} />
							<Route path="tokens" element={<ThemesWorkspace />} />
							<Route path="export" element={<ExportPage />} />
							<Route path="settings/agent" element={<AgentSettingsPage />} />
						</Route>

						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</HashRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}
