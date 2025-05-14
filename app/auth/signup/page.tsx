"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [accountType, setAccountType] = useState("customer")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (accountType === "company") {
        // Create company profile in Firestore
        await setDoc(doc(db, "companies", user.uid), {
          companyName,
          email,
          accountType: "company",
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: "Framgång",
          description: "Ditt företagskonto har skapats framgångsrikt.",
        });
        router.push("/dashboard");
      } else {
        // Create customer profile in Firestore
        await setDoc(doc(db, "customers", user.uid), {
          name,
          email,
          accountType: "customer",
          createdAt: new Date().toISOString(),
        });
        
        toast({
          title: "Framgång",
          description: "Ditt konto har skapats framgångsrikt.",
        });
        router.push("/marketplace");
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to create account. Please try again."),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Skapa konto</CardTitle>
          <CardDescription>Registrera dig för att börja handla eller skapa erbjudanden</CardDescription>
        </CardHeader>

        <Tabs value={accountType} onValueChange={setAccountType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="customer">Kund</TabsTrigger>
            <TabsTrigger value="company">Företag</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {accountType === "customer" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="company-name">Företagsnamn</Label>
                  <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={accountType === "company" ? "foretag@exempel.se" : "namn@exempel.se"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? "Laddar..." : "Registrera dig"}
              </Button>
              <div className="text-center text-sm">
                Har du redan ett konto?{" "}
                <Link href="/auth/signin" className="text-purple-600 hover:underline">
                  Logga in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  )
}
