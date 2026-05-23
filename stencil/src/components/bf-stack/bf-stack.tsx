import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-stack',
	styleUrl: 'bf-stack.css',
	shadow: true,
})
export class BfStack {
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
