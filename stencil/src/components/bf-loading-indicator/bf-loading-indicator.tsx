import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-loading-indicator',
	styleUrl: 'bf-loading-indicator.css',
	shadow: true,
})
export class BfLoadingIndicator {
	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot />
				</div>
			</Host>
		);
	}
}
