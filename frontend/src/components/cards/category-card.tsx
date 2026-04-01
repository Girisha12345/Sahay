import { Card } from "../ui/card";

export function CategoryCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button className="text-left" onClick={onClick}>
      <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
        <div className="text-3xl">{icon}</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </Card>
    </button>
  );
}
