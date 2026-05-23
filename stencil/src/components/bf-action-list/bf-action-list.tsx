import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-action-list',
	styleUrl: 'bf-action-list.css',
	shadow: true,
})
export class BfActionList {
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
