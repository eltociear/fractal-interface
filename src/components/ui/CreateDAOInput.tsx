import { Input } from "./Input";
import InputBox from "./InputBox";

const CreateDAOInput = (
  { dataType,
    value,
    onChange,
    label,
    helperText,
    disabled
  }: {
    dataType: string,
    value: string | undefined,
    onChange: (e: string) => void,
    label: string,
    helperText: string,
    disabled: boolean
  }) => {
  return (
    <InputBox label={label}>
      <div className="md:grid md:grid-cols-3 md:gap-4 flex flex-col items-center">
        <div className="md:col-span-2 w-full">
          <Input
            value={value || ""}
            type={dataType}
            min={undefined}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
            onKeyDown={undefined}
            borderColor="border-black-100"
          />
        </div>
        <div className="md:pt-0 pt-2 text-sm text-gray-50 text-center">{helperText}</div>
      </div>
    </InputBox>
  );
}

export default CreateDAOInput;
