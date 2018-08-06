(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ZedFormValidate = factory());
}(this, (function () {
  'use strict'

  const ZedFormValidate = {
    FormGroup: class FormGroup {
      constructor(name, callback, rules) {
        this.name = name;
        this.ref = document.querySelector(`[formGroup=${name}]`);
        this.callback = callback;
        this.valid = true;
        this.formControls = [];

        const formControls = this.ref.querySelectorAll('[formControl]');
        for (const formControl of formControls) {
          this.formControls.push(new window.ZedFormValidate.FormControl(formControl));
        }

        for (const key of Object.keys(rules)) {
          const formControl = this.formControls.find(item => item.name === key);
          formControl.addRules(rules[key]);
        }

        this.ref.querySelector('[submitButton]').addEventListener('click', this.submit.bind(this));
      }
      validate() {
        this.valid = true;

        for (const formControl of this.formControls) {
          if (!formControl.validate()) {
            this.valid = false;
          }
        }
      }
      submit() {
        this.validate();

        if (this.valid) {
          this.callback();
        }
      }
    },
    FormControl: class FormControl {
      constructor(ref) {
        this.name = ref.getAttribute('formControl');
        this.ref = ref;
        this.valid = true;
        this.errorMessage = '';
        this.errorMessages = {};
        this.errorLabel = '';
        this.required = false;
      }
      validate() {
        const value = this.ref.querySelector('input').value;
        this.valid = true;

        if (this.required) {
          if (!value) {
            this.valid = false;
            this.errorMessage = this.errorMessages.required;
          }
        }

        if (this.valid) {
          this.removeErrorLabel();
        } else {
          this.addErrorLabel();
        }

        return this.valid;
      }
      addRules(rules) {
        for (const rule of rules) {
          if (rule.required) {
            this.required = rule.required;
            this.errorMessages.required = rule.message;
          }
        }
      }
      addErrorLabel() {
        this.errorLabel = document.createElement('div');
        this.errorLabel.innerHTML = `
          <p class="error">${this.errorMessage}</>
        `;

        this.ref.appendChild(this.errorLabel);
      }
      removeErrorLabel() {
        if (this.ref.contains(this.errorLabel)) {
          this.ref.removeChild(this.errorLabel);
        }
      }
    }
  };

  return ZedFormValidate;
})));
