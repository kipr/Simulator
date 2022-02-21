export interface GeneralValidator {
  validate: (value: string, length?: number) => boolean;
}

export namespace Validators {
  export enum Types {
    Lowercase = 'lowercase',
    Uppercase = 'uppercase',
    Alpha = 'alpha',
    Numeric = 'number',
    Special = 'special',
    Length = 'length',
    Email = 'email',
  }

  export interface Lowercase extends GeneralValidator {
    type: Validators.Lowercase;
  }

  export namespace Lowercase {}

  export interface Uppercase extends GeneralValidator {
    type: Validators.Uppercase;
  }

  export namespace Uppercase {}

  export interface Alpha extends GeneralValidator {
    type: Validators.Alpha;
  }

  export namespace Alpha {}

  export interface Numeric extends GeneralValidator {
    type: Validators.Numeric;
  }
  
  export namespace Numeric {}

  export interface Special extends GeneralValidator {
    type: Validators.Special;
  } 

  export namespace Special {}

  export interface Length extends GeneralValidator {
    type: Validators.Length;
  }

  export namespace Length {}

  export interface Email extends GeneralValidator {
    type: Validators.Email;
  }

  export namespace Email {}

  export function validate(value: string, type: Types, length = 8): boolean {
    if (value === undefined || value === null || value === '') return false;
    switch (type) {
      case Types.Lowercase:
        return /(?=.*[a-z])/.test(value);
      case Types.Uppercase:
        return /(?=.*[A-Z])/.test(value);
      case Types.Alpha:
        return /(?=.*[a-zA-Z])/.test(value);
      case Types.Numeric:
        return /(?=.*\d)/.test(value);
      case Types.Special:
        return /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value);
      case Types.Length:
        return value.length >= length;
      case Types.Email:
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
      default:
        return false;
    }
  }

  export type Validator = Lowercase | Uppercase | Alpha | Numeric | Special | Email;

  export function validateMultiple(value: string, validators: Validators.Types[]): boolean {
    return validators.every(validator => validate(value, validator));
  }

  export function validatePassword(value: string): boolean {
    return validateMultiple(value, [
      Types.Lowercase,
      Types.Uppercase,
      Types.Numeric,
      Types.Length,
    ]);
  }
}