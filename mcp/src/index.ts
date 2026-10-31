import { loadConfig } from './config.js';
import { createHttpApp } from './app.js';

const config = loadConfig();
const app = createHttpApp(config);

app.listen(config.port, () => {
	console.log(
		`Bareframe MCP listening on :${config.port}${config.publicBasePath} (hosts: ${config.allowedHosts.join(', ')})`,
	);
});
