"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@/lib/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function TestUploadPage() {
    const [message, setMessage] = useState("");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const file = e.target.files[0];
        const auth = getAuth();

        try {
            // 1. Logga in användaren (eller hoppa över om redan inloggad)
            if (!auth.currentUser) {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    "nenad@nenad.se",
                    "hejhej"
                );
                console.log("✅ Inloggad som:", userCredential.user.email);
            }

            const user = auth.currentUser;
            console.log("👤 Firebase-användare:", user);

            if (!user) {
                setMessage("❌ Ingen inloggad användare – kan inte ladda upp");
                return;
            }

            // 2. Ladda upp filen
            const storage = getStorage(app);
            const storageRef = ref(storage, `test-uploads/${file.name}`);

            await uploadBytes(storageRef, file);
            setMessage("✅ Upload successful");

        } catch (error: any) {
            console.error("❌ Upload error", error);
            setMessage(`❌ Upload failed: ${error.message}`);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Testa bilduppladdning</h2>
            <input type="file" onChange={handleUpload} />
            <p className="mt-4 text-sm">{message}</p>
        </div>
    );
}
