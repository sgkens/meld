/**
 * MeldForms plugin object.
 * Provides basic form state management, validation, and submission helpers.
 * 
 * @type {object}
 * @property {function} install - Installs form validation helpers on the Meld API.
 * @property {function} setupHelpers - Sets up helpers for use in components.
 */
export const MeldForms = {
  /**
   * Installs the form manager helper on the API object.
   * Registers the `api.useForm` helper method.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {void}
   */
  install(api) {
    /**
     * Initializes form state, validation errors, and utility handlers.
     * 
     * @param {object} initialValues - Initial field values for the form.
     * @param {Object<string, string[]>} [rules={}] - Validation rules mapped by field names (e.g. `{ username: ['required'] }`).
     * @returns {object} Form control object containing fields, errors, submit handler, and validation function.
     * @returns {object} returns.fields - Reactive form fields state.
     * @returns {object} returns.errors - Reactive validation errors state.
     * @returns {function(function): function(Event): void} returns.handleSubmit - Higher-order function wrapping form submit.
     * @returns {function(): boolean} returns.validate - Manual trigger to validate all fields against rules.
     */
    api.useForm = (initialValues, rules = {}) => {
      const fields = api.meldState(initialValues);
      const errors = api.meldState({});

      /**
       * Validates all form fields against configured rules.
       * 
       * @returns {boolean} True if all validation rules pass, otherwise false.
       */
      const validate = () => {
        let valid = true;
        Object.keys(rules).forEach(key => {
          const val = fields[key];
          const r = rules[key];
          if (r.includes('required') && !val) {
            errors[key] = 'Required';
            valid = false;
          } else {
            delete errors[key];
          }
        });
        return valid;
      };

      /**
       * Wraps a submit callback, preventing default browser event behavior, validating the form,
       * and executing the callback with form fields if valid.
       * 
       * @param {function(object): void} cb - The callback to execute with fields when valid.
       * @returns {function(Event): void} Event handler function for form submit.
       */
      const handleSubmit = (cb) => (e) => {
        e.preventDefault();
        if (validate()) cb({ ...fields });
      };
      return { fields, errors, handleSubmit, validate };
    };
  },
  /**
   * Sets up helpers for components by returning an object containing `useForm`.
   * 
   * @param {object} api - The Meld API instance.
   * @returns {object} Object containing the form management helper.
   * @returns {function} returns.useForm - The useForm helper function.
   */
  setupHelpers(api) {
    return { useForm: api.useForm };
  }
};
