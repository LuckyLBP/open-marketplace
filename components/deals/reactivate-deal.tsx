'use client';

import { useMemo, useState } from 'react';
import { doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Deal } from '@/components/types/deal';
import { useFirebase } from '@/components/firebase-provider';
import { useToast } from '@/components/ui/use-toast';
import { useGlobalSettings, feeForDuration } from '@/hooks/useGlobalSettings';

import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Props = {
    deal: Deal;
    trigger?: React.ReactNode;
    onDone?: (updated: { expiresAt?: Date; feePercentage?: number; status?: 'approved' | 'active' | 'pending' }) => void;
};

export default function ReactivateDeal({ deal, trigger, onDone }: Props) {
    const { userType, user } = useFirebase();
    const { toast } = useToast();
    const { settings } = useGlobalSettings();

    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [saving, setSaving] = useState(false);
    const [hours, setHours] = useState<string>('24');

    // Ägarskap/behörighet
    const ownerUid =
        (deal as any).ownerId ??
        (deal as any).customerId ??
        null;

    const isOwner =
        !!user && (deal.companyId === user.uid || ownerUid === user.uid);

    const canManage =
        userType === 'superadmin' || userType === 'admin' || isOwner;

    // Policys styrs av accountType
    const accountType = (deal as any).accountType as 'customer' | 'company' | undefined;

    const maxHours = useMemo(() => {
        if (userType === 'superadmin' || userType === 'admin') return 720; // 30 d
        if (accountType === 'customer') return 168; // 7 d
        return 720; // company
    }, [userType, accountType]);

    const options = useMemo(() => {
        const base = [12, 24, 36, 48, 72, 96, 120, 144, 168, 192, 216, 240, 288, 336, 384, 432, 480, 528, 576, 624, 672, 720];
        return base.filter(h => h <= maxHours);
    }, [maxHours]);

    const h = parseInt(hours, 10) || 0;

    // Rätt ordning: feeForDuration(serviceFees, durationHours)
    const feePct = feeForDuration(settings?.serviceFees ?? {}, h);

    // ✅ Statuspolicy: kund → 'pending', annars → 'approved'
    const nextStatus: 'approved' | 'pending' =
        accountType === 'customer' && !(userType === 'admin' || userType === 'superadmin')
            ? 'pending'
            : 'approved';

    const defaultTrigger = <Button size="sm" variant="secondary">Återaktivera</Button>;
    const goNext = () => setStep(2);
    const goBack = () => setStep(1);

    async function handleConfirm() {
        if (!canManage) {
            toast({ title: 'Åtkomst nekad', description: 'Du saknar behörighet.', variant: 'destructive' });
            return;
        }
        if (!Number.isFinite(h) || h < 12 || h > maxHours) {
            toast({ title: 'Ogiltig varaktighet', description: `Välj 12–${maxHours} timmar.`, variant: 'destructive' });
            setStep(1);
            return;
        }

        try {
            setSaving(true);
            const newExpires = new Date(Date.now() + h * 60 * 60 * 1000);

            await updateDoc(doc(db, 'deals', deal.id!), {
                expiresAt: Timestamp.fromDate(newExpires),
                updatedAt: serverTimestamp(),
                status: nextStatus,        // 'approved' eller 'pending'
                feePercentage: feePct,
            });

            toast({
                title: nextStatus === 'approved' ? 'Erbjudandet är aktivt' : 'Skickat för granskning',
                description:
                    nextStatus === 'approved'
                        ? `${deal.title} förlängdes ${h}h och är live.`
                        : `${deal.title} förlängdes ${h}h och väntar på godkännande.`,
            });

            onDone?.({ expiresAt: newExpires, feePercentage: feePct, status: nextStatus });

            setOpen(false);
            setStep(1);
        } catch (e: any) {
            toast({ title: 'Kunde inte återaktivera', description: e?.message ?? 'Ett fel uppstod.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger ?? defaultTrigger}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Återaktivera erbjudande</SheetTitle>
                </SheetHeader>

                {/* Steg 1: Varaktighet */}
                {step === 1 && (
                    <div className="mt-6 space-y-4">
                        <div className="text-sm text-muted-foreground">Erbjudande</div>
                        <div className="font-medium">{deal.title}</div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Varaktighet</Label>
                            <Select value={hours} onValueChange={setHours}>
                                <SelectTrigger id="duration">
                                    <SelectValue placeholder="Välj antal timmar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Timmar</SelectLabel>
                                        {options.map((opt) => (
                                            <SelectItem key={opt} value={String(opt)}>
                                                {opt < 24 ? `${opt} h` : `${Math.round(opt / 24)} dagar (${opt} h)`}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Max: {maxHours < 24 ? `${maxHours} h` : `${Math.round(maxHours / 24)} dagar (${maxHours} h)`} baserat på roll.
                            </p>
                        </div>

                        <Separator />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
                            <Button onClick={goNext} disabled={!h || h < 12 || h > maxHours}>Nästa</Button>
                        </div>
                    </div>
                )}

                {/* Steg 2: Preview/confirm */}
                {step === 2 && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Bekräfta återaktivering</div>
                            <div className="font-medium">{deal.title}</div>
                            <div className="text-xs text-muted-foreground">
                                Ny varaktighet: {h < 24 ? `${h} timmar` : `${Math.round(h / 24)} dagar (${h} h)`}
                            </div>
                            <div className="text-xs text-muted-foreground">Serviceavgift: {feePct}%</div>
                            <div className="text-xs text-muted-foreground">
                                Status efteråt: {nextStatus === 'approved' ? 'approved (aktivt)' : 'pending (granskning krävs)'}
                            </div>
                        </div>

                        <Separator />
                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={goBack}>Tillbaka</Button>
                            <Button onClick={handleConfirm} disabled={saving}>
                                {saving ? 'Sparar…' : 'Bekräfta'}
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
