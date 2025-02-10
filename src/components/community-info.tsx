import { Card, CardHeader } from "./ui/card";

interface CommunityInfoProps {
  title: string;
  description: string;
}
export default function CommunityInfo({ title, description }: CommunityInfoProps) {
  function FormattedDescription({ description }: { description?: string }) {
    if (!description) return null;

    // Split the description by double newline to create paragraphs
    const paragraphs = description.split("\n\n").filter((p) => p.trim() !== "");

    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-sm">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return (
    <Card className="min-h-32 rounded-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold">{title}</h1>
        <FormattedDescription description={description} />
      </CardHeader>
    </Card>
  );
}
