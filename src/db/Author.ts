namespace Author {
  export enum Type {
    User = 'user',
    Organization = 'organization',
  }

  export interface User {
    type: Type.User;
    id: string;
  }

  export const user = (id: string): User => ({
    type: Type.User,
    id,
  });

  export interface Organization {
    type: Type.Organization;
    id: string;
  }

  export const organization = (id: string): Organization => ({
    type: Type.Organization,
    id,
  });
}

type Author = Author.User | Author.Organization;

export default Author;