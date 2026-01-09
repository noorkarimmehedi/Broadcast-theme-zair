/**
 * Focal Theme Custom Elements Implementation for Broadcast Theme
 * Implements: toggle-button, mobile-navigation, collapsible-content
 */

// Robust Toggle Button logic that works across all browsers (including Safari)
const initToggleButtons = () => {
    document.querySelectorAll('[is="toggle-button"]').forEach(button => {
        if (button.dataset.toggleInit) return;

        button.addEventListener('click', (event) => {
            event.preventDefault();
            const controlsId = button.getAttribute('aria-controls');
            const target = document.getElementById(controlsId);
            const expanded = button.getAttribute('aria-expanded') === 'true';

            button.setAttribute('aria-expanded', !expanded);

            if (target) {
                if (target.tagName.toLowerCase() === 'collapsible-content') {
                    target.toggle(!expanded);
                } else if (typeof target.open === 'function' && !expanded) {
                    target.open();
                } else if (typeof target.close === 'function' && expanded) {
                    target.close();
                } else if (target.tagName.toLowerCase() === 'mobile-navigation') {
                    !expanded ? target.open() : target.close();
                }
            }
        });
        button.dataset.toggleInit = 'true';
    });
};

document.addEventListener('DOMContentLoaded', initToggleButtons);
// Also run if content is updated (for Shopify theme editor)
document.addEventListener('shopify:section:load', initToggleButtons);
// Fallback for cases where DOMContentLoaded already fired
if (document.readyState !== 'loading') initToggleButtons();


if (!customElements.get('collapsible-content')) {
    class CollapsibleContent extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.style.overflow = 'hidden';
            this.style.transition = 'height 0.3s ease-out';
            if (this.parentElement.querySelector(`[aria-controls="${this.id}"]`).getAttribute('aria-expanded') !== 'true') {
                this.style.height = '0px';
            }
        }

        toggle(expand) {
            if (expand) {
                this.style.height = `${this.scrollHeight}px`;
                this.addEventListener('transitionend', () => {
                    if (this.style.height !== '0px') this.style.height = 'auto';
                }, { once: true });
            } else {
                this.style.height = `${this.scrollHeight}px`;
                requestAnimationFrame(() => {
                    this.style.height = '0px';
                });
            }
        }
    }

    customElements.define('collapsible-content', CollapsibleContent);
}

if (!customElements.get('mobile-navigation')) {
    class MobileNavigation extends HTMLElement {
        constructor() {
            super();
            this._open = false;
        }

        connectedCallback() {
            // Handle append-body if present
            if (this.hasAttribute('append-body') && this.parentElement !== document.body) {
                document.body.appendChild(this);
                return; // connectedCallback will be called again
            }

            this.closeButton = this.querySelector('[data-action="close"]');
            this.overlay = this.querySelector('.drawer__overlay');

            if (this.closeButton) {
                this.closeButton.addEventListener('click', () => this.close());
            }

            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.close());
            }

            this.addEventListener('close', () => this.close());
        }

        open() {
            this._open = true;
            this.setAttribute('open', '');
            document.documentElement.classList.add('lock-scroll');

            // Update all associated toggle buttons
            const toggleButtons = document.querySelectorAll(`[aria-controls="${this.id}"]`);
            toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', 'true'));

            this.dispatchEvent(new CustomEvent('opened', { bubbles: true }));
        }

        close() {
            this._open = false;
            this.removeAttribute('open');
            document.documentElement.classList.remove('lock-scroll');

            // Update all associated toggle buttons
            const toggleButtons = document.querySelectorAll(`[aria-controls="${this.id}"]`);
            toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));

            this.dispatchEvent(new CustomEvent('closed', { bubbles: true }));
        }
    }

    customElements.define('mobile-navigation', MobileNavigation);
}
