"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useFirebase } from "@/components/firebase-provider"
import { useLanguage } from "@/components/language-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { sv } from "date-fns/locale"

type Deal = {
  id: string
  title: string
  description: string
  price: number
  duration: number
  imageUrl: string
  expiresAt: Date
  createdAt: Date
}

export default function Dashboard() {
  const { user, loading } = useFirebase()
  const router = useRouter()
  const { t } = useLanguage()
  const [deals, setDeals] = useState<Deal[]>([])
  const [activeDeals, setActiveDeals] = useState<Deal[]>([])
  const [expiredDeals, setExpiredDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "deals"), where("companyId", "==", user.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const fetchedDeals: Deal[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedDeals.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            price: data.price,
            duration: data.duration,
            imageUrl: data.imageUrl,
            expiresAt: data.expiresAt.toDate(),
            createdAt: data.createdAt.toDate(),
          })
        })

        setDeals(fetchedDeals)

        const now = new Date()
        setActiveDeals(fetchedDeals.filter((deal) => deal.expiresAt > now))
        setExpiredDeals(fetchedDeals.filter((deal) => deal.expiresAt <= now))
      } catch (error) {
        console.error("Error fetching deals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDeals()
    }
  }, [user])

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">{t("Loading")}...</div>
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("Dashboard")}</h1>
        <Link href="/dashboard/create-deal">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            {t("Create Deal")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Total Deals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Active Deals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("Expired Deals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredDeals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">{t("Active Deals")}</TabsTrigger>
          <TabsTrigger value="expired">{t("Expired Deals")}</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {isLoading ? (
            <div className="text-center py-8">{t("Loading")}...</div>
          ) : activeDeals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeDeals.map((deal) => (
                <Card key={deal.id}>
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={deal.imageUrl || "/placeholder.svg?height=200&width=400"}
                      alt={deal.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{deal.title}</CardTitle>
                    <CardDescription>
                      {new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(deal.price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">{t("Time Left")}:</span>{" "}
                      {formatDistanceToNow(deal.expiresAt, { locale: sv, addSuffix: true })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/dashboard/deals/${deal.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        {t("View Details")}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("No active deals")}.{" "}
              <Link href="/dashboard/create-deal" className="text-purple-600 hover:underline">
                {t("Create one now")}
              </Link>
              .
            </div>
          )}
        </TabsContent>
        <TabsContent value="expired">
          {isLoading ? (
            <div className="text-center py-8">{t("Loading")}...</div>
          ) : expiredDeals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiredDeals.map((deal) => (
                <Card key={deal.id} className="opacity-75">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={deal.imageUrl || "/placeholder.svg?height=200&width=400"}
                      alt={deal.title}
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{deal.title}</CardTitle>
                    <CardDescription>
                      {new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(deal.price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">{t("Expired")}:</span>{" "}
                      {formatDistanceToNow(deal.expiresAt, { locale: sv, addSuffix: true })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/dashboard/deals/${deal.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        {t("View Details")}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t("No expired deals found")}</div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
