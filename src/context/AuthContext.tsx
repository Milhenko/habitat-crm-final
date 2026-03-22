"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "Super Administrador" | "Administrador de Marketing" | "Asesor";

export interface User {
  id: string;
  name: string;
  role: Role;
  initials: string;
}

interface AuthContextType {
  user: User;
  setUser: (userId: string) => void;
}

export const MOCK_USERS: User[] = [
  {
    id: "sa-1",
    name: "C. Argeñal",
    role: "Super Administrador",
    initials: "CA",
  },
  {
    id: "sa-2",
    name: "R. Mosquera",
    role: "Super Administrador",
    initials: "RM",
  },
  {
    id: "mkt-1",
    name: "M. Rodríguez",
    role: "Administrador de Marketing",
    initials: "MR",
  },
  {
    id: "asesor-1",
    name: "J. Pérez",
    role: "Asesor",
    initials: "JP",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(MOCK_USERS[0]);

  const setUser = (userId: string) => {
    const found = MOCK_USERS.find((u) => u.id === userId);
    if (found) setUserState(found);
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
