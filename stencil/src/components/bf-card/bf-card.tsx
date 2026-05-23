import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-card',
	styleUrl: 'bf-card.css',
	shadow: true,
})
export class BfCard {
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
