import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-calendar',
	styleUrl: 'bf-calendar.css',
	shadow: true,
})
export class BfCalendar {
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
