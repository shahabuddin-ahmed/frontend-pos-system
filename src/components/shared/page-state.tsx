import { Card, CardContent } from '@/components/ui/card';

export function PageState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <Card className={error ? 'border-red-200' : ''}>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}
