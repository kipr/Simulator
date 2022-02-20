export default interface IRoute {
  path: string;
  exact: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  index?: number;
  name: string; // Used to update page infon and title. 
  protected: boolean; // This will defines if the route is proteted or not
}