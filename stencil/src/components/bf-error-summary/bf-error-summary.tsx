import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-error-summary',
	styleUrl: 'bf-error-summary.css',
	shadow: true,
})
export class BfErrorSummary {
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
