import { Card } from '@bareframe/react';
import { AppPage, AppPageHeader } from '../../app/AppUi';

export function AgentSettingsPage() {
	return (
		<AppPage narrow>
			<AppPageHeader
				title="Agent & MCP"
				lead="Connect AI assistants to Bareframe’s public catalog and your project canvas."
			/>
			<Card variant="outlined" title="Hosted servers">
				<p>
					Public read-only tools live at <code>https://bareframe.org/mcp</code>. Canvas writes use the studio
					endpoint with a project token from project settings.
				</p>
				<p className="app-muted-inline">
					See <a href="#/components/mcp">Connect agent</a> for snippets, tool list, and rate limits.
				</p>
			</Card>
		</AppPage>
	);
}
