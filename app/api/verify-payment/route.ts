/* import { NextResponse } from "next/server"
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    // Verify the payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Update the checkout session in Firestore
    const q = query(collection(db, "checkoutSessions"), where("sessionId", "==", sessionId))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const sessionDoc = querySnapshot.docs[0]
    await updateDoc(sessionDoc.ref, {
      status: "completed",
      paymentIntentId: session.payment_intent,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
 */
