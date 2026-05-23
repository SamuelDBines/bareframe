import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-carousel',
	styleUrl: 'bf-carousel.css',
	shadow: true,
})
export class BfCarousel {
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
