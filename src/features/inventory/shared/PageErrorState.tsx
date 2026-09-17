import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface PageErrorStateProps {
  description: string;
  title: string;
}

export function PageErrorState({ description, title }: PageErrorStateProps) {
  return (
    <div className="grid gap-6">
      <Card className="border-red-100 bg-red-50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
