namespace LegalAcceptance {
  export enum State {
    AwaitingParentalConsent = 'awaiting-parental-consent',
    ObtainedParentalConsent = 'obtained-parental-consent',
    ObtainedUserConsent = 'obtained-user-consent',
  }
  
  export interface AwaitingParentalConsent {
    state: State.AwaitingParentalConsent;
    version: number;
    sentAt: string;
    parentEmailAddress: string;
    noAutoDelete: boolean;
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
}

type LegalAcceptance = LegalAcceptance.AwaitingParentalConsent | LegalAcceptance.ObtainedParentalConsent | LegalAcceptance.ObtainedUserConsent;

export default LegalAcceptance;