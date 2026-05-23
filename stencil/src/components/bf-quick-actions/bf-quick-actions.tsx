import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-quick-actions',
	styleUrl: 'bf-quick-actions.css',
	shadow: true,
})
export class BfQuickActions {
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
