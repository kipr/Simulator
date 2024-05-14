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
    autoDelete: boolean;
  }

  export interface AwaitingParentalConsent {
    state: State.AwaitingParentalConsent;
    version: number;
    sentAt: string;
    parentEmailAddress: string;
    autoDelete: boolean;
  }

  export interface ObtainedParentalConsent {
    state: State.ObtainedParentalConsent;
    version: number;
    receivedAt: string;
    parentEmailAddress: string;
    parentalConsentUri: string;
  }

  export interface ObtainedUserConsent {
    state: State.ObtainedUserConsent;
    version: number;
  }

  export const isConsentObtained = (legalAcceptance: LegalAcceptance): boolean => {
    if (!legalAcceptance) return false;

    return legalAcceptance.state === State.ObtainedUserConsent
      || legalAcceptance.state === State.ObtainedParentalConsent;
  };

  export const shouldAutoDelete = (legalAcceptance: LegalAcceptance): boolean => {
    if (!legalAcceptance) return false;

    switch (legalAcceptance.state) {
      case LegalAcceptance.State.NotStarted:
      case LegalAcceptance.State.AwaitingParentalConsent:
        return legalAcceptance.autoDelete;
      default:
        return false;
    }
  };
}

type LegalAcceptance = LegalAcceptance.NotStarted | LegalAcceptance.AwaitingParentalConsent | LegalAcceptance.ObtainedParentalConsent | LegalAcceptance.ObtainedUserConsent;

export default LegalAcceptance;