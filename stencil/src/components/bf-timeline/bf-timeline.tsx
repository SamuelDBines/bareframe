import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-timeline',
	styleUrl: 'bf-timeline.css',
	shadow: true,
})
export class BfTimeline {
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
