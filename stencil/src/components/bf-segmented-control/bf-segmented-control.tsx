import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-segmented-control',
	styleUrl: 'bf-segmented-control.css',
	shadow: true,
})
export class BfSegmentedControl {
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
