import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DURATION_OPTIONS = [12, 24, 36];

export default function BoostDurationSelector({
    duration,
    setDuration,
}: {
    duration: number;
    setDuration: (d: number) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Välj visningstid</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {DURATION_OPTIONS.map((hrs) => (
                        <Button
                            key={hrs}
                            variant={hrs === duration ? "default" : "outline"}
                            onClick={() => setDuration(hrs)}
                        >
                            {hrs}h
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
