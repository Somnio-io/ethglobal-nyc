"use client";

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Token from "web3-token";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface IAuthContext {
  signIn: () => Promise<User | undefined>;
  signOut: () => void;
  isAuthed: boolean;
  isLoading: boolean;
  account?: string;
  showContractInputForm: boolean;
  setShowContractInputForm: Dispatch<SetStateAction<boolean>>;
}

export interface User {
  address: string;
  connectedContract?: string;
}

const AppContext = createContext<IAuthContext>({} as IAuthContext);

const AUTH_LOGIN_URL = "https://q2p3u7dpgi.execute-api.us-east-1.amazonaws.com/prod/user";

export function AuthWrapper({ children }: any) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [showContractInputForm, setShowContractInputForm] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      console.log(`Calling check user in auth context`);
      const user = await checkUser();
      if (user) {
        setAccount(user.address);
        setIsLoading(false);
        return;
      } else {
        router.replace(`/`);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem("token");
    console.log(`checkUser is running!! -> `, token);
    if (!token) {
      return undefined;
    }
    const auth = await fetch(AUTH_LOGIN_URL, {
      method: "GET",
      cache: "no-cache",
      headers: {
        Authorization: token,
      },
    });

    if (auth.status === 200) {
      const response = JSON.parse(await auth.json());
      const user = response.user as User;
      if (user.address) {
        localStorage.setItem("token", token);
        setIsAuthed(true);
        return user;
      }
      setIsAuthed(false);
    } else {
      setIsAuthed(false);
    }
  };

  const signIn = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // generating a token with 3 day of expiration time
    let token: string = "";
    try {
      token = await Web3Token.sign(async (msg: string) => await signer.signMessage(msg), {
        statement: "I accept the Terms of Service: https://linkt.tv/tos",
        expires_in: "1 days",
        // won't be able to use this token for one hour
        // not_before: new Date(Date.now() + (3600 * 1000)),
        // nonce: 11111111,
      });
    } catch (error) {
      console.log(error);
    }

    const login = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      cache: "no-cache",
      headers: {
        Authorization: token,
      },
    });
    if (login.status === 201) {
      const response = JSON.parse(await login.json());
      const user = response.user as User;
      if (user.address) {
        localStorage.setItem("token", token);
        setAccount(user.address);
        setIsAuthed(true);
        return user;
      }
      setIsAuthed(false);
    } else {
      setIsAuthed(false);
    }
  };

  const signOut = () => {
    localStorage.setItem("token", "");
    setIsAuthed(false);
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        signIn,
        signOut,
        account,
        isAuthed,
        showContractInputForm,
        setShowContractInputForm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AppContext);
}
