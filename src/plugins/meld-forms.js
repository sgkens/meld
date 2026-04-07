export const MeldForms = {
  install(api) {
    api.useForm = (initialValues, rules = {}) => {
      const fields = api.meldState(initialValues);
      const errors = api.meldState({});
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
      const handleSubmit = (cb) => (e) => {
        e.preventDefault();
        if (validate()) cb({ ...fields });
      };
      return { fields, errors, handleSubmit, validate };
    };
  }
};
