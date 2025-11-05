'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const companySchema = z.object({
    companyName: z.string().min(2, 'Ange företagsnamn'),
    orgNumber: z.string().min(4, 'Ange organisationsnummer'),
    address: z.string().min(3, 'Ange adress'),
    phone: z.string().min(6, 'Ange telefonnummer'),
    postalCode: z.string().min(3, 'Ange postnummer'),
    city: z.string().min(2, 'Ange ort'),
    email: z.string().email('Ogiltig e-postadress'),
    password: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
});

type CompanyFormData = z.infer<typeof companySchema>;
const t = (s?: string) => (typeof s === 'string' ? s.trim() : s);

export default function CompanyForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
    });

    const onSubmit = async (data: CompanyFormData) => {
        setSubmitting(true);
        setErr(null);
        try {
            // 1) skapa auth-user
            const cred = await createUserWithEmailAndPassword(
                auth,
                t(data.email)!,
                data.password
            );
            const uid = cred.user.uid;

            // 2) users/{uid} – canonicaliserat
            await setDoc(
                doc(db, 'users', uid),
                {
                    email: t(data.email),
                    accountType: 'company',
                    companyApproved: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            // 3) companies/{uid} – alltid pending vid signup
            await setDoc(
                doc(db, 'companies', uid),
                {
                    accountType: 'company',
                    companyName: t(data.companyName),
                    orgNumber: t(data.orgNumber),
                    address: t(data.address),
                    phone: t(data.phone),
                    postalCode: t(data.postalCode),
                    city: t(data.city),
                    email: t(data.email),

                    // 🔑 viktigt för guard + regler:
                    isApproved: false,
                    status: 'pending',
                    approvedAt: null,
                    approvedBy: null,

                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            toast({
                title: 'Konto skapat',
                description: 'Ditt företagskonto är skapat och väntar på godkännande.',
            });

            // justera om du vill till /dashboard eller annan sida
            router.push('/');
        } catch (e: any) {
            setErr(e?.message ?? 'Något gick fel vid registreringen');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="companyName">Företagsnamn</Label>
                    <Input id="companyName" placeholder="Ex: ACME AB" {...register('companyName')} />
                    {errors.companyName && (
                        <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="orgNumber">Organisationsnummer</Label>
                    <Input id="orgNumber" placeholder="Ex: 556123-4567" {...register('orgNumber')} />
                    {errors.orgNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.orgNumber.message}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="address">Adress</Label>
                    <Input id="address" placeholder="Gatuadress" {...register('address')} />
                    {errors.address && (
                        <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="postalCode">Postnummer</Label>
                    <Input id="postalCode" placeholder="Ex: 123 45" {...register('postalCode')} />
                    {errors.postalCode && (
                        <p className="text-sm text-red-500 mt-1">{errors.postalCode.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="city">Ort</Label>
                    <Input id="city" placeholder="Stad/Ort" {...register('city')} />
                    {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" placeholder="Ex: 070-123 45 67" {...register('phone')} />
                    {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input id="email" type="email" placeholder="namn@foretag.se" {...register('email')} />
                    {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="password">Lösenord</Label>
                    <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                    {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
                {submitting ? 'Registrerar…' : 'Skapa företagskonto'}
            </Button>
        </form>
    );
}
