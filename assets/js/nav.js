/**
 * nav.js — Hamburger menu toggle + active link highlighting
 *
 * Relies on markup pattern:
 *   <header class="site-header" data-active="home">
 *     <nav class="primary-nav" id="primary-nav">
 *       <a href="..." data-nav="home">Home</a>
 *       ...
 *     </nav>
 *     <button class="nav-toggle" aria-controls="primary-nav" aria-expanded="false">
 *       <span class="nav-toggle__bar"></span>
 *       <span class="nav-toggle__bar"></span>
 *       <span class="nav-toggle__bar"></span>
 *     </button>
 *   </header>
 *
 * No imports/exports. Vanilla ES2015+. Load with <script src="assets/js/nav.js" defer>.
 */

(function () {
  'use strict';

  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var selectors = [
      'main > section:not(:first-child)',
      '.glass-panel',
      '.product-card',
      '.pillar-card',
      '.step-card',
      '.founder-card',
      '.sensor-card',
      '.pipe-step',
      '.actuator-card',
      '.outcome-card',
      '.platform-grid',
      '.cta-band'
    ];

    var elements = Array.from(document.querySelectorAll(selectors.join(',')))
      .filter(function (el, index, list) {
        return list.indexOf(el) === index && !el.closest('.site-header, .site-footer');
      });

    if (!elements.length) {
      return;
    }

    elements.forEach(function (el, index) {
      var isCard = el.matches('.glass-panel, .product-card, .pillar-card, .step-card, .founder-card, .sensor-card, .pipe-step, .actuator-card, .outcome-card');
      var delay = isCard ? Math.min((index % 6) * 70, 280) : 0;
      var reveal = 'up';

      if (isCard && index % 3 === 1) {
        reveal = 'left';
      } else if (isCard && index % 3 === 2) {
        reveal = 'right';
      } else if (el.matches('.cta-band, .platform-grid')) {
        reveal = 'zoom';
      }

      el.classList.add('scroll-reveal');
      el.dataset.reveal = reveal;
      el.style.setProperty('--reveal-delay', delay + 'ms');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();

    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav    = document.getElementById('primary-nav');

    if (!header || !toggle || !nav) {
      return; // Missing elements — silently skip.
    }

    // ----------------------------------------------------------------
    // 1. Active-link highlighting
    // ----------------------------------------------------------------
    var activeKey = header.dataset.active;
    if (activeKey) {
      var activeLink = nav.querySelector('a[data-nav="' + activeKey + '"]');
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
      }
    }

    // ----------------------------------------------------------------
    // 2. Helpers
    // ----------------------------------------------------------------
    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    var mobileMQ = window.matchMedia('(max-width: 768px)');

    function syncAriaHidden() {
      if (mobileMQ.matches) {
        // On mobile, nav is hidden by default until the toggle opens it.
        if (header.getAttribute('data-open') !== 'true') {
          nav.setAttribute('aria-hidden', 'true');
        } else {
          nav.removeAttribute('aria-hidden');
        }
      } else {
        // On desktop, nav is always exposed.
        nav.removeAttribute('aria-hidden');
      }
    }

    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      header.setAttribute('data-open', 'true');
      syncAriaHidden();
      // Move focus to first link for keyboard users on mobile
      var firstLink = nav.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      header.setAttribute('data-open', 'false');
      syncAriaHidden();
    }

    // ----------------------------------------------------------------
    // 3. Hamburger click
    // ----------------------------------------------------------------
    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeMenu();
        toggle.focus();
      } else {
        openMenu();
      }
    });

    // ----------------------------------------------------------------
    // 4. ESC to close
    // ----------------------------------------------------------------
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    // ----------------------------------------------------------------
    // 5. Click outside to close
    // ----------------------------------------------------------------
    document.addEventListener('mousedown', function (e) {
      if (isOpen() && !header.contains(e.target)) {
        closeMenu();
      }
    });

    // ----------------------------------------------------------------
    // 6. Basic focus trap inside open mobile menu (Tab/Shift+Tab cycles)
    // ----------------------------------------------------------------
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') {
        return;
      }

      var focusable = Array.from(nav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) {
        return;
      }

      var first = focusable[0];
      var last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab on first → wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab on last → wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // ----------------------------------------------------------------
    // 7. Close menu when a nav link is clicked (mobile UX)
    // ----------------------------------------------------------------
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && isOpen()) {
        closeMenu();
      }
    });

    // Initialize: set aria-hidden correctly for the current viewport,
    // and keep it in sync whenever the viewport crosses the 768 px boundary.
    syncAriaHidden();
    mobileMQ.addEventListener('change', syncAriaHidden);
  });
}());
