import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
