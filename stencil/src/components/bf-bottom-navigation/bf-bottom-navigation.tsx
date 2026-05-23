import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-bottom-navigation',
	styleUrl: 'bf-bottom-navigation.css',
	shadow: true,
})
export class BfBottomNavigation {
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
