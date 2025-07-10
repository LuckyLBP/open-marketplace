'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CustomerForm from '@/components/auth/signup/customer-form';
import CompanyForm from '@/components/auth/signup/company-form';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Skapa konto</CardTitle>
          <CardDescription>
            Välj kontotyp och fyll i uppgifterna för att registrera dig
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Val mellan Privatperson och Företag */}
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="customer">Privatperson</TabsTrigger>
              <TabsTrigger value="company">Företag</TabsTrigger>
            </TabsList>

            {/* Formulär för Privatperson */}
            <TabsContent value="customer">
              <CustomerForm />
            </TabsContent>

            {/* Formulär för Företag */}
            <TabsContent value="company">
              <CompanyForm />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Länk till inloggning */}
          <div className="text-center text-sm">
            Har du redan ett konto?{' '}
            <Link href="/auth/signin" className="text-purple-600 hover:underline">
              Logga in
            </Link>
          </div>

          {/* Länk till startsidan */}
          <div className="text-center text-sm">
            <Link href="/" className="text-gray-500 hover:underline inline-flex items-center gap-1">
              <Home className="w-4 h-4" />
              Till startsidan
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
