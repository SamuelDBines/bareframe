import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-icon',
	styleUrl: 'bf-icon.css',
	shadow: true,
})
export class BfIcon {
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
