(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ZedFormValidate = factory());
}(this, (function () {
  'use strict'

  const ZedFormValidate = {
    toString: Object.prototype.toString,
    isDef: v => {
      return v !== undefined && v !== null;
    },
    isFormElement: element => {
      return toString.call(element) === '[object HTMLFormElement]';
    },
    isRegExp: regexp => {
      return toString.call(regexp) === '[object RegExp]';
    },
    FormGroup: class FormGroup {
      constructor(name, rules, callback) {
        if (!(this instanceof window.ZedFormValidate.FormGroup)) {
          throw new Error('ZedFormValidate: FormGroup is a constructor and should be called with the `new` keyword');
        }
        this.name = name;
        this.ref = document.querySelector(`[formGroup=${name}]`);
        this.callback = callback;
        this.valid = true;
        this.formControls = [];

        if (!window.ZedFormValidate.isDef(this.ref)) {
          throw new Error(`FormGroup: Not found form have name: ${name}`);
        }
        if (!window.ZedFormValidate.isFormElement(this.ref)) {
          throw new Error(`FormGroup: ${name} is not a form element`);
        }

        const formControls = this.ref.querySelectorAll('[formControl]');
        for (const formControl of formControls) {
          this.formControls.push(new window.ZedFormValidate.FormControl(formControl));
        }

        for (const key of Object.keys(rules)) {
          const formControl = this.getFormControl(key);
          formControl.addRules(rules[key]);
        }

        const submitButton = this.ref.querySelector('[submitButton]');
        if (submitButton) {
          submitButton.addEventListener('click', this.submit.bind(this));
        }
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
          if (typeof this.callback === 'function') {
            this.callback();
          }
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
          if (formControl) {
            formControl.addErrorLabel(errorMessage);
            if (!focus) {
              formControl.focus();
              focus = true;
            }
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
        this.errorLabel.classList.add('error');
        this.errorLabel.innerHTML = '<p></p>';
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

        if (this.required && !this.value.trim()) {
          this.valid = false;
          this.errorMessage = this.errorMessages.required;
        } else if (this.maxLength && this.maxLength < this.value.length) {
          this.valid = false;
          this.errorMessage = this.errorMessages.maxLength;
        } else if (this.minLength && this.minLength > this.value.length) {
          this.valid = false;
          this.errorMessage = this.errorMessages.minLength;
        }  else if (this.maxValue && this.maxValue < this.value) {
          this.valid = false;
          this.errorMessage = this.errorMessages.maxValue;
        }  else if (this.minValue && this.minValue > this.value) {
          this.valid = false;
          this.errorMessage = this.errorMessages.minValue;
        } else if (this.validator && !this.validator.test(this.value)) {
          this.valid = false;
          this.errorMessage = this.errorMessages.validator;
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
          if (window.ZedFormValidate.isDef(rule.required)) {
            this.required = rule.required;
            this.errorMessages.required = rule.message;
          } else if (window.ZedFormValidate.isDef(rule.maxLength)) {
            this.maxLength = rule.maxLength;
            this.errorMessages.maxLength = rule.message;
          } else if (window.ZedFormValidate.isDef(rule.minLength)) {
            this.minLength = rule.minLength;
            this.errorMessages.minLength = rule.message;
          } else if (window.ZedFormValidate.isDef(rule.maxValue)) {
            this.maxValue = rule.maxValue;
            this.errorMessages.maxValue = rule.message;
          }  else if (window.ZedFormValidate.isDef(rule.minValue)) {
            this.minValue = rule.minValue;
            this.errorMessages.minValue = rule.message;
          } else if (window.ZedFormValidate.isDef(rule.validator)) {
            if (!window.ZedFormValidate.isRegExp(rule.validator)) {
              throw new Error('ZedFormValidate: validator must be a regex string');
            };

            this.validator = rule.validator;
            this.errorMessages.validator = rule.message;
          }
        }
      }
      addErrorLabel(errorMessage) {
        this.errorLabel.querySelector('.error > p').innerText = errorMessage;

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
        this.errorLabel.querySelector('.error > p').innerText = '';
        this.removeErrorLabel();
      }
      focus() {
        this.ref.querySelector('input').focus();
      }
    }
  };

  return ZedFormValidate;
})));
