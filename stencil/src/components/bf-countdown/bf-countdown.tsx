import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-countdown',
	styleUrl: 'bf-countdown.css',
	shadow: true,
})
export class BfCountdown {
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
