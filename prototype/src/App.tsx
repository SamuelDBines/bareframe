import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
const ComponentDetailPage = lazy(() =>
	import('./pages/components/ComponentDetail').then((m) => ({ default: m.ComponentDetailPage })),
);
import { ComponentsGallery } from './pages/components/ComponentsGallery';
import { ComponentsLayout } from './pages/components/ComponentsLayout';
import { GettingStartedPage } from './pages/components/GettingStartedPage';
import { MigratingToReactPage } from './pages/components/MigratingToReactPage';
import { McpPage } from './pages/components/McpPage';
import { TokensPage } from './pages/components/TokensPage';
import { LandingPage } from './pages/site/Landing';
import { PricingPage } from './pages/site/Pricing';
import { ExamplesPage } from './pages/site/ExamplesPage';
import { SignInPage } from './pages/site/SignIn';
import { SignUpPage } from './pages/site/SignUp';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { LegacyDesignerRedirect } from './LegacyDesignerRedirect';
import { AppHomePage } from './pages/app/AppHomePage';
import { AppProjectPage } from './pages/app/AppProjectPage';
import { ShareCanvasPage } from './pages/app/ShareCanvasPage';
import { DemoJourneyReviewPage, DemoShareCanvasPage } from './pages/app/DemoJourneyReviewPage';
import { NewProductPage } from './pages/designer/NewProductPage';
import { PackageGeneratingPage } from './pages/designer/PackageGeneratingPage';
import { PackageReviewPage } from './pages/designer/PackageReviewPage';
import { FlowMapDemoPage } from './pages/designer/FlowMapDemoPage';

function DocsRedirect() {
	const { pathname } = useLocation();
	const rest = pathname.replace(/^\/docs\/?/, '');
	return <Navigate to={rest ? `/components/${rest}` : '/components'} replace />;
}

export default function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
			<LegacyDesignerRedirect />
			<HashRouter>
				<Routes>
					<Route element={<AppShell />}>
						<Route index element={<LandingPage />} />
						<Route path="pricing" element={<PricingPage />} />
						<Route path="examples" element={<ExamplesPage />} />
						<Route path="sign-up" element={<SignUpPage />} />
						<Route path="sign-in" element={<SignInPage />} />

						<Route path="docs/*" element={<DocsRedirect />} />
						<Route path="docs" element={<Navigate to="/components" replace />} />

						<Route path="components" element={<ComponentsLayout />}>
							<Route index element={<ComponentsGallery />} />
							<Route path="tokens" element={<TokensPage />} />
							<Route path="mcp" element={<McpPage />} />
							<Route path="migrating" element={<MigratingToReactPage />} />
							<Route path="start" element={<GettingStartedPage />} />
							<Route path=":slug" element={
								<Suspense fallback={<p className="card">Loading component docs…</p>}>
									<ComponentDetailPage />
								</Suspense>
							} />
						</Route>

						<Route path="app" element={<AppHomePage />} />
						<Route path="app/project/:projectId" element={<AppProjectPage />} />
						<Route path="app/product/new" element={<NewProductPage appMode />} />
						<Route path="app/product/generating/:jobId" element={<PackageGeneratingPage appMode />} />
						<Route path="app/product/:packageId" element={<PackageReviewPage appMode />} />

						<Route path="share/:token" element={<ShareCanvasPage />} />
						<Route path="demo/journey-review" element={<DemoJourneyReviewPage />} />
						<Route path="demo/share-canvas" element={<DemoShareCanvasPage />} />
						<Route path="demo/flow-map" element={<FlowMapDemoPage />} />

						<Route path="designer/*" element={<Navigate to="/app" replace />} />

						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</HashRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}
