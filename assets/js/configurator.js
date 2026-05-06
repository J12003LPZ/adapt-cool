/**
 * configurator.js - Option toggles + live spec readout
 *
 * Reads container elements with data-config-group="chassis|pump|ai|coolant"
 * and renders button[role="radio"] items for each option group.
 * On selection change, recomputes totals and writes into [data-summary="price|flow|db|tdp"].
 * "Request quote" button builds a mailto with the selection summary.
 *
 * No imports/exports. Vanilla ES2015+. Load with <script src="assets/js/configurator.js" defer>.
 */

(function () {
  'use strict';

  var BASE_PRICE     = 1500;
  var BASE_FLOW_RATE = 300;
  var BASE_DB        = 32;
  var BASE_TDP       = 250;

  var CONFIG = [
    {
      group: 'chassis',
      label: 'Chassis',
      options: [
        { id: 'chassis-compact', label: 'Compact',    priceDelta: 0,   flowRateDelta: 0,   dbDelta: 0,  tdpCapacity: 0   },
        { id: 'chassis-mid',     label: 'Mid Tower',  priceDelta: 150, flowRateDelta: 50,  dbDelta: 2,  tdpCapacity: 100 },
        { id: 'chassis-full',    label: 'Full Tower', priceDelta: 350, flowRateDelta: 120, dbDelta: 3,  tdpCapacity: 250 }
      ]
    },
    {
      group: 'pump',
      label: 'Pump',
      options: [
        { id: 'pump-standard',    label: 'Standard',    priceDelta: 0,   flowRateDelta: 0,   dbDelta: 0,  tdpCapacity: 0   },
        { id: 'pump-performance', label: 'Performance', priceDelta: 200, flowRateDelta: 100, dbDelta: 1,  tdpCapacity: 150 },
        { id: 'pump-apex',        label: 'Apex',        priceDelta: 450, flowRateDelta: 250, dbDelta: 2,  tdpCapacity: 350 }
      ]
    },
    {
      group: 'ai',
      label: 'AI Module',
      options: [
        { id: 'ai-lite',       label: 'Lite',       priceDelta: 0,   flowRateDelta: 0,  dbDelta: -1, tdpCapacity: 0   },
        { id: 'ai-pro',        label: 'Pro',        priceDelta: 300, flowRateDelta: 20, dbDelta: -2, tdpCapacity: 50  },
        { id: 'ai-datacenter', label: 'Datacenter', priceDelta: 800, flowRateDelta: 50, dbDelta: -3, tdpCapacity: 200 }
      ]
    },
    {
      group: 'coolant',
      label: 'Coolant',
      options: [
        { id: 'coolant-standard',    label: 'Standard',   priceDelta: 0,   flowRateDelta: 0,   dbDelta: 0,  tdpCapacity: 0   },
        { id: 'coolant-eco',         label: 'Eco',        priceDelta: 80,  flowRateDelta: -20, dbDelta: -1, tdpCapacity: 20  },
        { id: 'coolant-enterprise',  label: 'Enterprise', priceDelta: 250, flowRateDelta: 40,  dbDelta: 0,  tdpCapacity: 100 }
      ]
    }
  ];

  // State: currently selected option ID per group (default = first option)
  var selection = {};
  CONFIG.forEach(function (g) {
    selection[g.group] = g.options[0].id;
  });

  function computeTotals() {
    var price = BASE_PRICE;
    var flow  = BASE_FLOW_RATE;
    var db    = BASE_DB;
    var tdp   = BASE_TDP;

    CONFIG.forEach(function (g) {
      var opt = g.options.find(function (o) { return o.id === selection[g.group]; });
      if (opt) {
        price += opt.priceDelta;
        flow  += opt.flowRateDelta;
        db    += opt.dbDelta;
        tdp   += opt.tdpCapacity;
      }
    });

    return { price: price, flow: flow, db: db, tdp: tdp };
  }

  function updateSummary() {
    var t = computeTotals();
    var priceEl = document.querySelector('[data-summary="price"]');
    var flowEl  = document.querySelector('[data-summary="flow"]');
    var dbEl    = document.querySelector('[data-summary="db"]');
    var tdpEl   = document.querySelector('[data-summary="tdp"]');
    if (priceEl) { priceEl.textContent = '$' + t.price.toLocaleString(); }
    if (flowEl)  { flowEl.textContent  = t.flow + ' L/h'; }
    if (dbEl)    { dbEl.textContent    = t.db + ' dB(A)'; }
    if (tdpEl)   { tdpEl.textContent   = t.tdp + ' W'; }
  }

  function syncGroupButtons(container, selectedId) {
    var buttons = container.querySelectorAll('[role="radio"]');
    buttons.forEach(function (btn) {
      var isSelected = btn.dataset.optionId === selectedId;
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  }

  function renderGroups() {
    CONFIG.forEach(function (groupConfig) {
      var container = document.querySelector('[data-config-group="' + groupConfig.group + '"]');
      if (!container) { return; }

      // Remove existing children safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.classList.add('config-group');
      container.setAttribute('role', 'radiogroup');
      container.setAttribute('aria-label', groupConfig.label);

      groupConfig.options.forEach(function (opt, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', idx === 0 ? 'true' : 'false');
        btn.setAttribute('data-option-id', opt.id);
        btn.setAttribute('data-group', groupConfig.group);
        btn.className = 'config-option';

        // Build label text using only textContent (no HTML)
        var deltaText = '';
        if (opt.priceDelta > 0)       { deltaText = ' (+$' + opt.priceDelta + ')'; }
        else if (opt.priceDelta < 0)  { deltaText = ' (-$' + Math.abs(opt.priceDelta) + ')'; }
        btn.textContent = opt.label + deltaText;

        btn.addEventListener('click', function () {
          selection[groupConfig.group] = opt.id;
          syncGroupButtons(container, opt.id);
          updateSummary();
        });

        // Arrow key navigation within radiogroup
        btn.addEventListener('keydown', function (e) {
          var buttons = Array.from(container.querySelectorAll('[role="radio"]'));
          var i = buttons.indexOf(btn);
          var next;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            next = buttons[(i + 1) % buttons.length];
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            next = buttons[(i - 1 + buttons.length) % buttons.length];
          }
          if (next) { next.focus(); next.click(); }
        });

        container.appendChild(btn);
      });
    });
  }

  function initQuoteButton() {
    var quoteBtn = document.querySelector('[data-quote]');
    if (!quoteBtn) { return; }

    quoteBtn.addEventListener('click', function () {
      var totals = computeTotals();
      var lines = [
        'CRYO-CORE / Submerge Configuration Request',
        ''
      ];

      CONFIG.forEach(function (g) {
        var opt = g.options.find(function (o) { return o.id === selection[g.group]; });
        if (opt) { lines.push(g.label + ': ' + opt.label); }
      });

      lines.push('');
      lines.push('--- Summary ---');
      lines.push('Estimated Price: $' + totals.price.toLocaleString());
      lines.push('Flow Rate: ' + totals.flow + ' L/h');
      lines.push('Noise Level: ~' + totals.db + ' dB(A)');
      lines.push('Supported TDP: ' + totals.tdp + ' W');

      var subject = 'Quote Request - Configured System';
      var body    = lines.join('\n');

      window.location.href = 'mailto:hello@yourcompany.example'
        + '?subject=' + encodeURIComponent(subject)
        + '&body='    + encodeURIComponent(body);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderGroups();
    updateSummary();
    initQuoteButton();
  });
}());
