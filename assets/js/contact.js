/**
 * contact.js — Form validation + mailto fallback
 *
 * Targets <form data-contact-form>.
 * On submit: validates [required] and type=email fields natively via
 * checkValidity(). Shows inline <small data-error-for="fieldName"> messages.
 * On valid: builds a mailto: URL and sets window.location.href.
 *
 * No imports/exports. Vanilla ES2015+. Load with <script src="assets/js/contact.js" defer>.
 */

(function () {
  'use strict';

  var CONTACT_EMAIL = 'hello@yourcompany.example';

  /**
   * Return a human-readable validation message for a field.
   */
  function getErrorMessage(field) {
    var val = field.validity;
    if (val.valueMissing)  { return 'This field is required.'; }
    if (val.typeMismatch)  { return 'Please enter a valid email address.'; }
    if (val.tooShort)      { return 'Minimum ' + field.minLength + ' characters required.'; }
    if (val.tooLong)       { return 'Maximum ' + field.maxLength + ' characters allowed.'; }
    if (val.patternMismatch) { return field.title || 'Invalid format.'; }
    return 'Invalid value.';
  }

  /**
   * Show an error for a specific field.
   */
  function showError(form, field) {
    var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
    if (errorEl) {
      errorEl.textContent = getErrorMessage(field);
      errorEl.classList.add('is-visible');
    }
    field.setAttribute('aria-invalid', 'true');
  }

  /**
   * Clear the error for a specific field.
   */
  function clearError(form, field) {
    var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
    field.removeAttribute('aria-invalid');
  }

  /**
   * Build a mailto: URL from form field values.
   */
  function buildMailto(form) {
    var fields = Array.from(form.elements).filter(function (el) {
      return el.name && el.tagName !== 'BUTTON';
    });

    // Subject comes from a field named "subject", otherwise use default
    var subjectField = form.querySelector('[name="subject"]');
    var subject = (subjectField && subjectField.value.trim())
      ? subjectField.value.trim()
      : 'Inquiry from cryogenic-industrial.com';

    // Build body: "Name: value" lines for every field
    var bodyLines = fields.map(function (el) {
      var label = el.labels && el.labels[0]
        ? el.labels[0].textContent.trim()
        : el.name.charAt(0).toUpperCase() + el.name.slice(1);
      return label + ': ' + (el.value || '(not provided)');
    });

    var body = bodyLines.join('\n');

    return 'mailto:' + encodeURIComponent(CONTACT_EMAIL)
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(body);
  }

  /**
   * Wire up a single contact form.
   */
  function initForm(form) {
    var fields = Array.from(form.elements).filter(function (el) {
      return el.name && el.tagName !== 'BUTTON';
    });

    // Clear errors on input change
    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        clearError(form, field);
      });

      field.addEventListener('change', function () {
        clearError(form, field);
      });
    });

    // Submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Run native validation
      var isValid = form.checkValidity();

      // Show errors for invalid fields
      fields.forEach(function (field) {
        if (!field.checkValidity()) {
          showError(form, field);
        } else {
          clearError(form, field);
        }
      });

      if (!isValid) {
        // Focus the first invalid field
        var firstInvalid = fields.find(function (f) { return !f.checkValidity(); });
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Build and open mailto link
      var mailtoUrl = buildMailto(form);
      window.location.href = mailtoUrl;
    });
  }

  // Initialize all contact forms on the page
  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form[data-contact-form]');
    forms.forEach(initForm);
  });
}());
