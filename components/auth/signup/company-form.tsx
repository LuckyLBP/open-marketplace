'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const companySchema = z.object({
    companyName: z.string().min(2, 'Företagsnamn krävs'),
    orgNumber: z.string().min(6, 'Orgnummer krävs'),
    address: z.string().min(2, 'Adress krävs'),
    phone: z.string().min(6, 'Telefonnummer krävs'),
    postalCode: z.string().min(3, 'Postnummer krävs'),
    city: z.string().min(2, 'Postort krävs'),
    email: z.string().email('Ogiltig e-postadress'),
    password: z.string().min(6, 'Minst 6 tecken krävs'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
    });

    const onSubmit = async (data: CompanyFormData) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'companies', uid), {
                companyName: data.companyName,
                orgNumber: data.orgNumber,
                address: data.address,
                phone: data.phone,
                postalCode: data.postalCode,
                city: data.city,
                email: data.email,
                accountType: 'company',
                createdAt: new Date(),
            });

            toast({ title: 'Företagskonto skapat!', description: 'Du är nu inloggad.' });
            router.push('/');
        } catch (err: any) {
            setErrorMsg(err.message || 'Något gick fel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Företagsnamn</Label>
                <Input {...register('companyName')} />
                {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Organisationsnummer</Label>
                <Input {...register('orgNumber')} />
                {errors.orgNumber && <p className="text-sm text-red-500">{errors.orgNumber.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Adress</Label>
                <Input {...register('address')} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Telefon</Label>
                <Input {...register('phone')} />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Postnummer</Label>
                <Input {...register('postalCode')} />
                {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Postort</Label>
                <Input {...register('city')} />
                {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>E-post</Label>
                <Input type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Lösenord</Label>
                <Input type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
                {loading ? 'Registrerar företag...' : 'Skapa företagskonto'}
            </Button>
        </form>
    );
}
