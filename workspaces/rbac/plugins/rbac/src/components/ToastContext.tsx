/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState, useMemo, createContext, useContext } from 'react';

type ToastContextType = {
  toastMessage: string;
  setToastMessage: (message: string) => void;
};

export const ToastContext = createContext<ToastContextType>({
  toastMessage: '',
  setToastMessage: () => {},
});

export const ToastContextProvider = (props: any) => {
  const [toastMessage, setToastMessage] = useState('');
  const toastContextProviderValue = useMemo(
    () => ({ setToastMessage, toastMessage }),
    [setToastMessage, toastMessage],
  );
  return (
    <ToastContext.Provider value={toastContextProviderValue}>
      {props.children}
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);
