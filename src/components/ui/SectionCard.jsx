import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export function SectionCard({ actions, children, kicker, title }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          {kicker && <CardDescription className="uppercase tracking-wider text-xs font-semibold text-primary/80">{kicker}</CardDescription>}
          {title && <CardTitle className="text-xl mt-1">{title}</CardTitle>}
        </div>
        {actions && <div>{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
