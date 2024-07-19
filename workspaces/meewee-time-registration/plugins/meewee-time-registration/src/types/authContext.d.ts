export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: string | null;
};

export type AuthAction =
  | {
      type: 'LOGIN';
      payload: { userName: string | null; token: string | null };
    }
  | { type: 'LOGOUT' };

export type AuthContextProps = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
};
