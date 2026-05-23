import { Component, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-video-player',
	styleUrl: 'bf-video-player.css',
	shadow: true,
})
export class BfVideoPlayer {
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
