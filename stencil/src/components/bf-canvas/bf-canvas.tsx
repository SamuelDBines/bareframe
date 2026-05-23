import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-canvas',
	styleUrl: 'bf-canvas.css',
	shadow: true,
})
export class BfCanvas {
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
