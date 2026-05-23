import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-command-palette',
	styleUrl: 'bf-command-palette.css',
	shadow: true,
})
export class BfCommandPalette {
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
