import { Input, InputProps } from "@/(components)/ui/input";
import { Label } from "@radix-ui/react-label";

export function DefaultInput({
  type,
  name,
  placeholder,
  onChange,
  onSubmit,
  required,
}: InputProps) {
  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">{name}</Label>
        <Input
          type={type}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
}
