import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-message',
	styleUrl: 'bf-message.css',
	shadow: true,
})
export class BfMessage {
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
