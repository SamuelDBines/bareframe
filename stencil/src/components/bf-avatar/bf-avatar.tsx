import { Component, Element, Host, State, h } from '@stencil/core';

@Component({
	tag: 'bf-avatar',
	styleUrl: 'bf-avatar.css',
	shadow: true,
})
export class BfAvatar {
	@Element() el!: HTMLElement;

	@State() private imgHidden = false;
	@State() private revision = 0;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => {
			this.imgHidden = false;
			this.revision++;
		});
		this.observer.observe(this.el, { attributes: true });
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private buildInitials(name: string): string {
		if (!name.trim()) {
			return '';
		}
		const parts = name.trim().split(/\s+/).slice(0, 2);
		return parts.map((part) => part.charAt(0).toUpperCase()).join('');
	}

	private onImgError = () => {
		this.imgHidden = true;
	};

	render() {
		void this.revision;
		const name = this.el.getAttribute('name') || '';
		const src = this.el.getAttribute('src') || '';
		const alt = this.el.getAttribute('alt') || name || 'Avatar';
		const explicitInitials = this.el.getAttribute('initials');
		const initials = explicitInitials || this.buildInitials(name);
		const size = this.el.getAttribute('size') || 'md';
		const status = this.el.getAttribute('status') || '';
		const showStatus = status && ['online', 'away', 'busy', 'offline'].includes(status);

		return (
			<Host>
				<div class={`root size-${size}`} part="root">
					{src ? (
						<img
							class={{ image: true, hidden: this.imgHidden }}
							part="image"
							src={src}
							alt={alt}
							onError={this.onImgError}
						/>
					) : (
						''
					)}
					<div
						class={{ fallback: true, hidden: Boolean(src) && !this.imgHidden }}
						part="fallback"
						aria-label={alt}>
						{initials || '?'}
					</div>
					{showStatus ? <span class={`status ${status}`} part="status"></span> : ''}
				</div>
			</Host>
		);
	}
}
