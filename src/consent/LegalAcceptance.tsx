namespace LegalAcceptance {
  export enum State {
    NotStarted = 'not-started',
    AwaitingParentalConsent = 'awaiting-parental-consent',
    ObtainedParentalConsent = 'obtained-parental-consent',
    ObtainedUserConsent = 'obtained-user-consent',
  }

  export interface NotStarted {
    state: State.NotStarted;
    version: number;
    expiresAt: number;
  }

  export interface AwaitingParentalConsent {
    state: State.AwaitingParentalConsent;
    version: number;
    sentAt: number;
    parentEmailAddress: string;
    expiresAt: number;
  }

  export interface ObtainedParentalConsent {
    state: State.ObtainedParentalConsent;
    version: number;
    receivedAt: number;
    parentEmailAddress: string;
    parentalConsentUri: string;
    expiresAt: number;
  }

  export interface ObtainedUserConsent {
    state: State.ObtainedUserConsent;
    version: number;
  }

  export const getConsentStatus = (legalAcceptance: LegalAcceptance): 'valid' | 'invalid' | 'expired' => {
    if (!legalAcceptance) return 'invalid';

    switch (legalAcceptance.state) {
      case State.ObtainedUserConsent:
        return 'valid';
      case State.ObtainedParentalConsent:
        return legalAcceptance.expiresAt > Date.now() ? 'valid' : 'expired';
      case State.NotStarted:
      case State.AwaitingParentalConsent:
      default:
        return 'invalid';
    }
  };
}

type LegalAcceptance = LegalAcceptance.NotStarted | LegalAcceptance.AwaitingParentalConsent | LegalAcceptance.ObtainedParentalConsent | LegalAcceptance.ObtainedUserConsent;

export default LegalAcceptance;