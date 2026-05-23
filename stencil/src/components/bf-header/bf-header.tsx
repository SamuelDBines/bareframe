import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Site / app chrome for a top landmark. Prefer this for mastheads;
 * see `bf-edge` with attribute `header` for sticky viewport edges inside scroll regions.
 */
@Component({
	tag: 'bf-header',
	styleUrl: 'bf-header.css',
	shadow: true,
})
export class BfHeader {
	@Prop({ reflect: true }) sticky = false;

	render() {
		return (
			<Host>
				<header class="root" part="root">
					<slot />
				</header>
			</Host>
		);
	}
}
