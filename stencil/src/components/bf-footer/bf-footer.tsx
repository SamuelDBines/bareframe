import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Site / app chrome for a bottom landmark.
 * Use `bf-edge` with attribute `footer` when you need a sticky viewport edge helper instead.
 */
@Component({
	tag: 'bf-footer',
	styleUrl: 'bf-footer.css',
	shadow: true,
})
export class BfFooter {
	@Prop({ reflect: true }) sticky = false;

	render() {
		return (
			<Host>
				<footer class="root" part="root">
					<slot />
				</footer>
			</Host>
		);
	}
}
