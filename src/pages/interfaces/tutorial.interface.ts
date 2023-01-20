import LocalizedString from 'util/LocalizedString';

export default interface Tutorial {
  title?: LocalizedString;
  description?: LocalizedString;
  src?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  hoverBackgroundSize?: string;
  index?: number;
}