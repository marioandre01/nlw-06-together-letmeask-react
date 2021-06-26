import { useState, useEffect, createContext, ReactNode } from "react";
import { auth, firebase } from "../services/firebase";

type User = {
  id: string;
  name: string;
  avatar: string;
}

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {

  // inicia "user" como "undefined", quando o useState() está vazio, isso representa "undefined" como valor inicial
  const [user, setUser] = useState<User>();

  // função para o nome aparecer depois que ja se esta logado, e atualizar a pagina do componente NewRoom
  useEffect(() => {
    // onAuthStateChanged() - event listen - fica ouvindo o evento, se detectar que o usuario ja se logou na aplicação anteriormente
    // ele vai restornar o usuario "user"
    const unsubscribe = auth.onAuthStateChanged(user => {
      // verificar se o usuário tem informações dentro dele
      if (user) {
        const { displayName, photoURL, uid } = user;

        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Account.');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        });
      }
    });

    return () => {
      unsubscribe();
    }
  }, []);

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    // abrir o login do google como um popup na tela
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user;

      if (!displayName || !photoURL) {
        throw new Error('Missing information from Google Account.');
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL
      });

    }
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
}