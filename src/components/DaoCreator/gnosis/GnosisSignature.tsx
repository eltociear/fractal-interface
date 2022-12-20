import { Grid, Button, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { ethers } from 'ethers';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreator } from '../provider/hooks/useCreator';
import { TrustedAddress } from '../provider/types';

interface IGnosisSignatures {
  trustee: TrustedAddress;
  index: number;
  updateAddresses: (addresses: TrustedAddress[], index: number, error: boolean) => void;
  removeAddress: (index: number) => void;
}

const isSameAddress = (addr1: string, addr2: string) => {
  if (!isAddress(addr1) || !isAddress(addr2)) {
    return false;
  }
  return getAddress(addr1) === getAddress(addr2);
};

export function GnosisSignatures({
  trustee,
  index,
  updateAddresses,
  removeAddress,
}: IGnosisSignatures) {
  const {
    state: {
      gnosis: { trustedAddresses },
    },
  } = useCreator();

  const { t } = useTranslation(['common', 'daoCreate']);

  const updateAndValidateAddress = useCallback(
    (address: string, snapshotTrustedAddresses: TrustedAddress[]) => {
      let isValidAddress = false;
      let hasDuplicateAddresses = false;

      if (address.trim()) {
        isValidAddress = isAddress(address);
      }
      const updatedAddress = [...snapshotTrustedAddresses].map((trustedAddress, i, prev) => {
        const isDuplicate = i !== index && isSameAddress(trustedAddress.address, address);

        const duplicateAddresses = prev.filter(
          (prevAddr, dupIndex) =>
            i !== dupIndex && isSameAddress(prevAddr.address, trustedAddress.address)
        );

        if (isDuplicate) {
          hasDuplicateAddresses = true;
          isValidAddress = false;
        }

        return {
          ...trustedAddress,
          isValidAddress:
            (!isDuplicate && duplicateAddresses.length <= 1) || isAddress(trustedAddress.address),
          addressError:
            isDuplicate || duplicateAddresses.length > 1
              ? t('errorDuplicateAddress', { ns: 'daoCreate' })
              : undefined,
        };
      });

      const addressError = hasDuplicateAddresses
        ? t('errorDuplicateAddress', { ns: 'daoCreate' })
        : !isValidAddress && address.trim()
        ? t('errorInvalidAddress')
        : undefined;

      const updatedTrustee = { address: address, isValidAddress, addressError };

      updatedAddress[index] = updatedTrustee;
      updateAddresses(updatedAddress, index, isValidAddress);
    },
    [index, t, updateAddresses]
  );

  return (
    <Grid
      templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
      alignItems="center"
      my="1rem"
      data-testid={`gnosisConfig-signer-${index}`}
    >
      <LabelWrapper errorMessage={trustee.addressError}>
        <Input
          value={trustee.address}
          placeholder={ethers.constants.AddressZero}
          onChange={event => updateAndValidateAddress(event.target.value, trustedAddresses)}
        />
      </LabelWrapper>
      {trustedAddresses.length > 1 && (
        <Button
          variant="text"
          onClick={() => removeAddress(index)}
        >
          {t('remove')}
        </Button>
      )}
    </Grid>
  );
}
