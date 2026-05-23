import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-otp-input',
	styleUrl: 'bf-otp-input.css',
	shadow: true,
})
export class BfOtpInput {
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
