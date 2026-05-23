import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-metric-card',
	styleUrl: 'bf-metric-card.css',
	shadow: true,
})
export class BfMetricCard {
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
