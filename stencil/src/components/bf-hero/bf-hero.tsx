import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-hero',
	styleUrl: 'bf-hero.css',
	shadow: true,
})
export class BfHero {
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
