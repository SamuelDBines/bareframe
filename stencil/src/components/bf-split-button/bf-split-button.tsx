import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-split-button',
	styleUrl: 'bf-split-button.css',
	shadow: true,
})
export class BfSplitButton {
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
