import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-key-value-list',
	styleUrl: 'bf-key-value-list.css',
	shadow: true,
})
export class BfKeyValueList {
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
