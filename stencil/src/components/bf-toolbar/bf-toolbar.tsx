import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-toolbar',
	styleUrl: 'bf-toolbar.css',
	shadow: true,
})
export class BfToolbar {
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
