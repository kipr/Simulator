/**
 * Validator utility
 */

export interface GeneralValidator {
  validate: (value: string, length?: number) => boolean;
}

/**
 * Namespace containing various validators for different types of data.
 * Used for validating user input on Forms and the Login page.
 */
export namespace Validators {
  /**
   * Enum representing the types of validators available.
   */
  export enum Types {
    Lowercase = 'lowercase',
    Uppercase = 'uppercase',
    Alpha = 'alpha',
    Numeric = 'number',
    Special = 'special',
    Length = 'length',
    Email = 'email',
    Date = 'date',
  }

  export interface Lowercase extends GeneralValidator {
    type: Validators.Lowercase;
  }

  /**
   * Namespace for the lowercase validator.
   */
  export namespace Lowercase {
    // Add properties and methods specific to the lowercase validator here if needed
  }

  /**
   * Interface for the uppercase validator.
   */
  export interface Uppercase extends GeneralValidator {
    type: Validators.Uppercase;
  }

  /**
   * Namespace for the uppercase validator.
   */
  export namespace Uppercase {
    // Add properties and methods specific to the uppercase validator here if needed
  }

  /**
   * Interface for the alpha validator.
   */
  export interface Alpha extends GeneralValidator {
    type: Validators.Alpha;
  }

  /**
   * Namespace for the alpha validator.
   */
  export namespace Alpha {
    // Add properties and methods specific to the alpha validator here if needed
  }

  /**
   * Interface for the numeric validator.
   */
  export interface Numeric extends GeneralValidator {
    type: Validators.Numeric;
  }
  
  /**
   * Namespace for the numeric validator.
   */
  export namespace Numeric {
    // Add properties and methods specific to the numeric validator here if needed
  }

  /**
   * Interface for the special character validator.
   */
  export interface Special extends GeneralValidator {
    type: Validators.Special;
  } 

  /**
   * Namespace for the special character validator.
   */
  export namespace Special {
    // Add properties and methods specific to the special character validator here if needed
  }

  /**
   * Interface for the length validator.
   */
  export interface Length extends GeneralValidator {
    type: Validators.Length;
  }

  /**
   * Namespace for the length validator.
   */
  export namespace Length {
    // Add properties and methods specific to the length validator here if needed
  }

  /**
   * Interface for the email validator.
   */
  export interface Email extends GeneralValidator {
    type: Validators.Email;
  }

  /**
   * Namespace for the email validator.
   */
  export namespace Email {
    // Add properties and methods specific to the email validator here if needed
  }

  export interface Date extends GeneralValidator {
    type: Validators.Date;
  }

  export namespace Date {}

  /**
   * Validates the given value based on the specified validator type.
   * @param value - The value to be validated.
   * @param type - The type of validator to be used.
   * @param length - The minimum length required for the value (only applicable for length validator).
   * @returns A boolean indicating whether the value is valid or not.
   */
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
      case Types.Date:
        // TODO: validate that it's a real date (e.g. 02/30/2000 should not pass)
        return /^(0[1-9]|1[012])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}$/.test(value);
      default:
        return false;
    }
  }

  /**
   * Type alias for the different validator types.
   */
  export type Validator = Lowercase | Uppercase | Alpha | Numeric | Special | Email | Date;

  /**
   * Validates the given value against multiple validators.
   * @param value - The value to be validated.
   * @param validators - An array of validator types to be used.
   * @returns A boolean indicating whether the value is valid for all the validators or not.
   */
  export function validateMultiple(value: string, validators: Validators.Types[]): boolean {
    return validators.every(validator => validate(value, validator));
  }

  /**
   * Validates the given value as a password.
   * @param value - The value to be validated.
   * @returns A boolean indicating whether the value is a valid password or not.
   */
  export function validatePassword(value: string): boolean {
    return validateMultiple(value, [
      Types.Lowercase,
      Types.Uppercase,
      Types.Numeric,
      Types.Length,
    ]);
  }
}