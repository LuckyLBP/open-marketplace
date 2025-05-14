"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"
import confetti from "canvas-confetti"

export default function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      router.push("/marketplace")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`, {
          method: "GET",
        })

        if (response.ok) {
          setSuccess(true)
          // Trigger confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        } else {
          router.push("/marketplace")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        router.push("/marketplace")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!success) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t("Payment Successful!")}</CardTitle>
          <CardDescription>{t("Thank you for your purchase. Your transaction has been completed.")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">{t("A confirmation email has been sent to your email address.")}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/marketplace" className="w-full">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <ShoppingBag className="mr-2 h-4 w-4" />
              {t("Continue Shopping")}
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {t("Back to Home")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
