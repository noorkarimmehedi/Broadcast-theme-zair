/**
 * Focal Theme Custom Elements Implementation for Broadcast Theme
 * Implements: toggle-button, mobile-navigation, collapsible-content
 */

if (!customElements.get('toggle-button')) {
  class ToggleButton extends HTMLButtonElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.addEventListener('click', this.toggle.bind(this));
    }

    toggle() {
      const controlsId = this.getAttribute('aria-controls');
      const target = document.getElementById(controlsId);
      const expanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !expanded);

      if (target) {
        if (target.tagName.toLowerCase() === 'collapsible-content') {
          target.toggle(!expanded);
        } else if (typeof target.open === 'function' && !expanded) {
          target.open();
        } else if (typeof target.close === 'function' && expanded) {
          target.close();
        } else {
          // Fallback for generic elements
          target.setAttribute('aria-hidden', expanded);
        }
      }
    }
  }

  customElements.define('toggle-button', ToggleButton, { extends: 'button' });
}

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
    }

    connectedCallback() {
      this.closeButton = this.querySelector('[data-action="close"]');
      this.overlay = this.querySelector('.drawer__overlay');

      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => this.close());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }

      // Handle custom close action
      this.addEventListener('close', () => this.close());
    }

    open() {
      this.setAttribute('open', '');
      document.documentElement.classList.add('lock-scroll');
      this.dispatchEvent(new CustomEvent('opened', { bubbles: true }));
    }

    close() {
      this.removeAttribute('open');
      document.documentElement.classList.remove('lock-scroll');
      
      // Update toggle buttons
      const toggleButtons = document.querySelectorAll(`[aria-controls="${this.id}"]`);
      toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      
      this.dispatchEvent(new CustomEvent('closed', { bubbles: true }));
    }
  }

  customElements.define('mobile-navigation', MobileNavigation);
}
