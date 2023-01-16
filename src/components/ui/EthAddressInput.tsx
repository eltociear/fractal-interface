import { InputElementProps, FormControlOptions, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useAddress from '../../hooks/utils/useAddress';

export interface EthAddressInputProps
  extends Omit<InputElementProps, 'onChange' | 'placeholder' | 'type'>,
    FormControlOptions {
  onAddress: (address: string, isValid: boolean) => void;
}

export function EthAddressInput({ onAddress, ...rest }: EthAddressInputProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const { address, isValidAddress } = useAddress(inputValue.toLowerCase());

  useEffect(() => {
    if (address?.toLowerCase() === inputValue.toLowerCase()) {
      onAddress(address || '', isValidAddress || false);
    }
  }, [address, inputValue, isValidAddress, onAddress]);

  return (
    <Input
      value={inputValue}
      placeholder="0x0000...0000"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
      }}
      {...rest}
    />
  );
}
