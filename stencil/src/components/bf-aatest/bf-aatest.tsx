import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-aatest',
	styleUrl: 'bf-aatest.css',
	shadow: true,
})
export class BfAaTest {
	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot>hello</slot>
				</div>
			</Host>
		);
	}
}
