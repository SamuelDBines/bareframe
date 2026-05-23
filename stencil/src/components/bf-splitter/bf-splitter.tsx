import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-splitter',
	styleUrl: 'bf-splitter.css',
	shadow: true,
})
export class BfSplitter {
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
