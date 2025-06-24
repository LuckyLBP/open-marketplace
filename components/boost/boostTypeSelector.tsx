import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const BOOST_OPTIONS = [
    { type: "floating", label: "FloatingAd", pricePerHour: 20 },
    { type: "banner", label: "BannerAd", pricePerHour: 10 },
];

export default function BoostTypeSelector({
    boostType,
    setBoostType,
}: {
    boostType: string;
    setBoostType: (type: string) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Välj annonsplats</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={boostType} onValueChange={setBoostType}>
                    {BOOST_OPTIONS.map((option) => (
                        <div key={option.type} className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value={option.type} id={option.type} />
                            <Label htmlFor={option.type}>
                                {option.label} – {option.pricePerHour} kr / timme
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
