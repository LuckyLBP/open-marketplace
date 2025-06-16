"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type UserType = "customer" | "company" | "superadmin" | null;

type FirebaseContextType = {
    user: User | null;
    userType: UserType;
    loading: boolean;
};

const FirebaseContext = createContext<FirebaseContextType>({
    user: null,
    userType: null,
    loading: true
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userType, setUserType] = useState<UserType>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                try {
                    // Check if user is a company
                    const companyDoc = await getDoc(
                        doc(db, "companies", user.uid)
                    );
                    if (companyDoc.exists()) {
                        const data = companyDoc.data();
                        const role = data.accountType === "superadmin" ? "superadmin" : "company";
                        setUserType(role);
                    } else {
                        setUserType("customer");
                    }

                } catch (error) {
                    console.error("Error determining user type:", error);
                    setUserType(null);
                }
            } else {
                setUserType(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider value={{ user, userType, loading }}>
            {children}
        </FirebaseContext.Provider>
    );
}
