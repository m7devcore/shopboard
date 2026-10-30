import './style.css';

/**
 * ShopBoard Application Logic
 *
 * Implements accessible, lightweight demonstration interactivity:
 * - Native form validation handling.
 * - Non-persisting informational status messaging.
 */

function setupRegistrationForm() {
  const form = document.querySelector('#register-form');
  const feedbackElement = document.querySelector('#register-feedback');

  if (!form || !feedbackElement) {
    return;
  }

  const clearFeedback = () => {
    feedbackElement.textContent = '';
    feedbackElement.className = 'form-feedback';
  };

  // Clear previous message as soon as user begins editing any field
  form.addEventListener('input', clearFeedback);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Trigger browser's native HTML validation UI if invalid
    if (!form.checkValidity()) {
      clearFeedback();
      form.reportValidity();
      return;
    }

    // Accessible demonstration success message
    feedbackElement.textContent =
      'Registration successful! Note: This is an educational demonstration only. No account has been created and no personal data or passwords have been stored.';
    feedbackElement.className = 'form-feedback is-visible is-success';

    // Reset input fields without retaining data
    form.reset();
  });
}

// Initialize on DOM readiness
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRegistrationForm);
} else {
  setupRegistrationForm();
}
