'use client';
import { useEffect, useState } from 'react';

export type GuestDetails = {
    fullName: string;
    email: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
};

type Props = {
    initial?: Partial<GuestDetails>;
    onChange: (v: GuestDetails, valid: boolean) => void;
    disabled?: boolean;
    className?: string;
};

const REQUIRED: (keyof GuestDetails)[] = ['fullName', 'email', 'addressLine1', 'postalCode', 'city', 'country'];

export default function GuestDetailsForm({ initial, onChange, disabled, className }: Props) {
    const [form, setForm] = useState<GuestDetails>({
        fullName: '', email: '', phone: '',
        addressLine1: '', addressLine2: '',
        postalCode: '', city: '', country: 'SE',
        ...initial,
    });

    const set = (k: keyof GuestDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(s => ({ ...s, [k]: e.target.value }));

    const valid =
        REQUIRED.every(k => (form[k] ?? '').toString().trim()) &&
        /\S+@\S+\.\S+/.test(form.email || '');

    useEffect(() => {
        try { localStorage.setItem('guestDetails', JSON.stringify(form)); } catch { }
        onChange(form, valid);
    }, [form]);

    const cls = "border rounded-md px-3 py-2 w-full";

    return (
        <div className={className ?? ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className={cls} placeholder="Fullständigt namn" value={form.fullName} onChange={set('fullName')} disabled={disabled} />
                <input className={cls} placeholder="E-post" type="email" value={form.email} onChange={set('email')} disabled={disabled} />
                <input className={cls} placeholder="Telefon (valfritt)" value={form.phone} onChange={set('phone')} disabled={disabled} />
                <input className={cls} placeholder="Adressrad 1" value={form.addressLine1} onChange={set('addressLine1')} disabled={disabled} />
                <input className={cls} placeholder="Adressrad 2 (valfritt)" value={form.addressLine2} onChange={set('addressLine2')} disabled={disabled} />
                <input className={cls} placeholder="Postnummer" value={form.postalCode} onChange={set('postalCode')} disabled={disabled} />
                <input className={cls} placeholder="Stad" value={form.city} onChange={set('city')} disabled={disabled} />
                <input className={cls} placeholder="Land (t.ex. SE)" value={form.country} onChange={set('country')} disabled={disabled} />
            </div>
        </div>
    );
}
