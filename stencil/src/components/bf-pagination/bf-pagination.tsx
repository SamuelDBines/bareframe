import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-pagination',
	styleUrl: 'bf-pagination.css',
	shadow: true,
})
export class BfPagination {
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
