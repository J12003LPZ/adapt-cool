/**
 * ui.js — Smooth scroll, FAQ accordion, tab panel toggles
 *
 * Features:
 *   1. Smooth scroll for <a href="#..."> in-page links.
 *   2. FAQ: animation timing + optional "expand all" via <button data-faq-expand-all>.
 *   3. Tabs: <div role="tablist"> with <button role="tab" aria-controls="panel-id">
 *            and <section role="tabpanel" id="panel-id" hidden>.
 *
 * No imports/exports. Vanilla ES2015+. Load with <script src="assets/js/ui.js" defer>.
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. SMOOTH SCROLL for in-page anchor links
     (CSS scroll-behavior:smooth handles most cases, but this also
     handles links that point to an ID on the current page loaded
     without browser support for the CSS property)
  ---------------------------------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a[href^="#"]');
      if (!el) { return; }
      var href = el.getAttribute('href');
      if (href === '#') { return; }

      var target = document.querySelector(href);
      if (!target) { return; }

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Move focus for keyboard users
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  }


  /* ----------------------------------------------------------------
     2. FAQ ACCORDION — progressive enhancement on <details data-faq>
  ---------------------------------------------------------------- */
  function initFaq() {
    var faqs = document.querySelectorAll('details[data-faq]');
    if (!faqs.length) { return; }

    // Add smooth animation timing via the Web Animations API if supported
    faqs.forEach(function (details) {
      var summary = details.querySelector('summary');
      var body    = details.querySelector('.faq-body');
      if (!summary || !body) { return; }

      // Track animation to cancel mid-flight
      var animation = null;
      var isClosing = false;
      var isOpening = false;

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        details.style.overflow = 'hidden';

        if (isClosing || !details.open) {
          openFaq(details);
        } else if (isOpening || details.open) {
          closeFaq(details);
        }
      });

      function openFaq(el) {
        el.style.height = el.offsetHeight + 'px';
        el.open = true;
        window.requestAnimationFrame(function () {
          isOpening = true;
          if (animation) { animation.cancel(); }
          animation = el.animate(
            { height: [el.offsetHeight + 'px', (el.offsetHeight + body.offsetHeight) + 'px'] },
            { duration: 250, easing: 'ease-out' }
          );
          animation.onfinish = function () {
            el.style.height = '';
            el.style.overflow = '';
            isOpening = false;
            animation = null;
          };
          animation.oncancel = function () { isOpening = false; };
        });
      }

      function closeFaq(el) {
        isClosing = true;
        if (animation) { animation.cancel(); }
        animation = el.animate(
          { height: [el.offsetHeight + 'px', summary.offsetHeight + 'px'] },
          { duration: 220, easing: 'ease-in' }
        );
        animation.onfinish = function () {
          isClosing = false;
          el.open = false;
          el.style.height = '';
          el.style.overflow = '';
          animation = null;
        };
        animation.oncancel = function () { isClosing = false; };
      }
    });

    // "Expand all" button
    var expandAllBtns = document.querySelectorAll('[data-faq-expand-all]');
    expandAllBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var allOpen = Array.from(faqs).every(function (d) { return d.open; });
        faqs.forEach(function (d) {
          d.open = !allOpen;
        });
        btn.textContent = allOpen ? 'Expand All' : 'Collapse All';
      });
    });
  }


  /* ----------------------------------------------------------------
     3. TAB PANELS
     Markup expected:
       <div role="tablist" aria-label="...">
         <button role="tab" aria-selected="true"  aria-controls="panel-a" id="tab-a">Tab A</button>
         <button role="tab" aria-selected="false" aria-controls="panel-b" id="tab-b">Tab B</button>
       </div>
       <section role="tabpanel" id="panel-a" aria-labelledby="tab-a">...</section>
       <section role="tabpanel" id="panel-b" aria-labelledby="tab-b" hidden>...</section>
  ---------------------------------------------------------------- */
  function initTabs() {
    var tablists = document.querySelectorAll('[role="tablist"]');
    if (!tablists.length) { return; }

    tablists.forEach(function (tablist) {
      var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      if (!tabs.length) { return; }

      function activateTab(selectedTab) {
        tabs.forEach(function (tab) {
          var panel = document.getElementById(tab.getAttribute('aria-controls'));
          if (tab === selectedTab) {
            tab.setAttribute('aria-selected', 'true');
            tab.removeAttribute('tabindex');
            if (panel) { panel.removeAttribute('hidden'); }
          } else {
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
            if (panel) { panel.setAttribute('hidden', ''); }
          }
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          activateTab(tab);
        });

        // Arrow key navigation within tablist
        tab.addEventListener('keydown', function (e) {
          var idx = tabs.indexOf(tab);
          var next;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            next = tabs[(idx + 1) % tabs.length];
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            next = tabs[(idx - 1 + tabs.length) % tabs.length];
          } else if (e.key === 'Home') {
            e.preventDefault();
            next = tabs[0];
          } else if (e.key === 'End') {
            e.preventDefault();
            next = tabs[tabs.length - 1];
          }

          if (next) {
            next.focus();
            activateTab(next);
          }
        });
      });

      // Initialize: activate the tab that has aria-selected="true" (or first)
      var initialTab = tabs.find(function (t) {
        return t.getAttribute('aria-selected') === 'true';
      }) || tabs[0];

      if (initialTab) {
        activateTab(initialTab);
      }
    });
  }


  /* ----------------------------------------------------------------
     Boot
  ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    initFaq();
    initTabs();
  });
}());
