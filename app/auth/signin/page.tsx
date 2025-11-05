"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Home } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid

      // Finns dokument i companies?
      const companySnap = await getDoc(doc(db, "companies", uid))
      if (companySnap.exists()) {
        const c = companySnap.data() as any
        const role = c.role || c.accountType

        // ✅ Adminer ska släppas igenom oavsett status
        if (role === "superadmin" || role === "admin") {
          toast({ title: "Framgång", description: "Du har loggat in." })
          router.push("/dashboard/settings") // eller "/dashboard"
          return
        }

        // ✅ Riktiga företag kräver approved
        const status = c.status || "pending"
        if (status !== "approved") {
          await signOut(auth)
          const msg = "Ditt företagskonto väntar på godkännande av superadmin."
          setErrorMsg(msg)
          toast({ title: "Konto låst", description: msg })
          return
        }

        toast({ title: "Framgång", description: "Du har loggat in." })
        router.push("/dashboard")
        return
      }

      // Ingen company-doc ⇒ behandla som kund
      toast({ title: "Framgång", description: "Du har loggat in." })
      router.push("/marketplace")
    } catch (e: any) {
      if (e?.code === "auth/user-disabled") {
        const msg = "Ditt företagskonto väntar på godkännande av superadmin."
        setErrorMsg(msg)
        toast({ title: "Konto låst", description: msg })
      } else {
        const map: Record<string, string> = {
          "auth/invalid-credential": "Fel e-post eller lösenord.",
          "auth/wrong-password": "Fel e-post eller lösenord.",
          "auth/user-not-found": "Ingen användare med den e-posten.",
          "auth/too-many-requests": "För många försök. Försök igen om en stund.",
        }
        const msg = map[e?.code] || "Inloggningen misslyckades. Kontrollera dina uppgifter."
        setErrorMsg(msg)
        toast({ title: "Fel", description: msg, variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Logga in</CardTitle>
          <CardDescription>
            Ange din e-post och lösenord för att logga in på ditt konto
            <br />
            <span className="text-xs text-muted-foreground">
              Företagskonton kan inte logga in förrän superadmin har godkänt ansökan.
            </span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
              {loading ? "Laddar..." : "Logga in"}
            </Button>
            <div className="text-center text-sm">
              Har du inget konto? <Link href="/auth/signup" className="text-purple-600 hover:underline">Registrera dig</Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/" className="text-gray-500 hover:underline inline-flex items-center gap-1">
                <Home className="w-4 h-4" />
                Till startsidan
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
