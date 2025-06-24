import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function BoostInfoCard({ deal }: { deal: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Boosta erbjudande
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">{deal.title}</p>
                <p className="text-muted-foreground">{deal.price}</p>
            </CardContent>
        </Card>
    );

}

