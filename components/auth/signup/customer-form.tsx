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

const customerSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    phone: z.string().min(6),
    postalCode: z.string().min(3),
    city: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });

    const onSubmit = async (data: CustomerFormData) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'customers', uid), {
                name: data.name,
                address: data.address,
                phone: data.phone,
                postalCode: data.postalCode,
                city: data.city,
                email: data.email,
                role: 'customer',
                createdAt: new Date(),
            });

            toast({ title: 'Konto skapat!', description: 'Du är nu inloggad.' });
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
                <Label>Namn</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {loading ? 'Skapar konto...' : 'Skapa konto'}
            </Button>
        </form>
    );
}
