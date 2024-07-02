export type LoginModalProps = {
  isLoginModalOpen: boolean;
  cbCloseModal: () => void;
  cbStoreTokenLogin: (userName: string, token: string) => void;
};
