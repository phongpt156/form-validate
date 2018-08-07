(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ZedFormValidate = factory());
}(this, (function () {
  'use strict'

  function isDef (v) {
    return v !== undefined && v !== null
  }

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
          const formControl = this.getFormControl(key);
          formControl.addRules(rules[key]);
        }

        this.ref.querySelector('[submitButton]').addEventListener('click', this.submit.bind(this));
      }
      getFormControl(name) {
        return this.formControls.find(item => item.name === name);
      }
      validate() {
        this.valid = true;

        for (const formControl of this.formControls) {
          if (!formControl.validate()) {
            this.valid = false;
            break;
          }
        }
      }
      submit() {
        this.validate();

        if (this.valid) {
          this.callback();
          this.resetError();
        }
      }
      reset() {
        this.valid = true;

        for (const formControl of this.formControls) {
          formControl.reset();
        }
      }
      resetError() {
        this.valid = true;

        for (const formControl of this.formControls) {
          formControl.resetError();
        }
      }
      addErrors(errors) {
        let focus = false;

        for (const key of Object.keys(errors)) {
          const formControl = this.getFormControl(key);
          const errorMessage = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
          formControl.addErrorLabel(errorMessage);
          if (!focus) {
            formControl.focus();
            focus = true;
          }
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
        this.errorLabel = document.createElement('div');
        this.errorLabel.innerHTML = '<p class="error"></p>';
        this.maxLength = '';
        this.minLength = '';
        this.required = false;
      }
      get value() {
        return this.ref.querySelector('input').value;
      }
      set value(value) {
        this.ref.querySelector('input').value = value;
      }
      validate() {
        this.valid = true;

        if (this.maxLength && this.maxLength < this.value.length) {
          this.valid = false;
          this.errorMessage = this.errorMessages.maxLength;
        }
        if (this.minLength && this.minLength > this.value.length) {
          this.valid = false;
          this.errorMessage = this.errorMessages.minLength;
        }
        if (this.required && !this.value.trim()) {
          this.valid = false;
          this.errorMessage = this.errorMessages.required;
        }

        this.removeErrorLabel();

        if (!this.valid) {
          this.focus();
          this.addErrorLabel(this.errorMessage);
        }

        return this.valid;
      }
      addRules(rules) {
        for (const rule of rules) {
          if (isDef(rule.required)) {
            this.required = rule.required;
            this.errorMessages.required = rule.message;
          } else if (isDef(rule.max)) {
            this.maxLength = rule.max;
            this.errorMessages.maxLength = rule.message;
          } else if (isDef(rule.min)) {
            this.minLength = rule.min;
            this.errorMessages.minLength = rule.message;
          }
        }
      }
      addErrorLabel(errorMessage) {
        this.errorLabel.querySelector('.error').innerText = errorMessage;

        this.ref.appendChild(this.errorLabel);
      }
      removeErrorLabel() {
        if (this.errorLabel && this.errorLabel.nodeType && this.ref.contains(this.errorLabel)) {
          this.ref.removeChild(this.errorLabel);
        }
      }
      reset() {
        this.value = '';
        this.resetError();
      }
      resetError() {
        this.valid = true;
        this.errorMessage = '';
        this.errorLabel.querySelector('.error').innerText = '';
        this.removeErrorLabel();
      }
      focus() {
        this.ref.querySelector('input').focus();
      }
    }
  };

  return ZedFormValidate;
})));
