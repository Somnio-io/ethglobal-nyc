import { Badge, BadgeProps } from "@/(components)/ui/badge";

interface AudienceSelectorProps {
  isSelected: boolean;
  name: string;
  handler: Function;
}

export function AudienceSelector({
  name,
  isSelected,
  handler,
}: BadgeProps & AudienceSelectorProps) {
  return (
    <Badge
      key={name}
      onClick={() => handler(name)}
      className={`hover:opacity-50 cursor-pointer stroke-primary stroke-2 bg-transparent ${
        isSelected ? `opacity-50 bg-primary` : null
      }`}
    >
      {name}
    </Badge>
  );
}
