import { Signer, utils } from 'ethers';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { AnyObject } from 'yup';
import { AddressValidationMap } from '../../../types';
import { Providers } from '../../../types/network';

export async function validateAddress({
  signerOrProvider,
  address,
}: {
  signerOrProvider: Signer | Providers;
  address: string;
}) {
  if (!!address && address.trim() && address.endsWith('.eth')) {
    const resolvedAddress = await signerOrProvider.resolveName(address).catch();
    if (resolvedAddress) {
      return {
        validation: {
          address: resolvedAddress,
          isValidAddress: true,
        },
        isValid: false,
      };
    } else {
      return {
        validation: {
          address: '',
          isValidAddress: false,
        },
        isValid: false,
      };
    }
  }
  const isValidAddress = utils.isAddress(address);
  if (isValidAddress) {
    return {
      validation: {
        address: address,
        isValidAddress: true,
      },
      isValid: true,
    };
  } else {
    return {
      validation: {
        address: '',
        isValidAddress: false,
      },
      isValid: false,
    };
  }
}

export const useValidationAddress = () => {
  /**
   * addressValidationMap
   * @description holds ENS resolved addresses
   * @dev updated via the `addressValidation`
   * @dev this is used for any other functions contained within this hook, to lookup resolved addresses in this session without requesting again.
   */
  const addressValidationMap = useRef<AddressValidationMap>(new Map());
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = signer || provider;
  const { t } = useTranslation(['daoCreate', 'common']);

  const addressValidationTest = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        const { validation } = await validateAddress({ signerOrProvider, address });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        return validation.isValidAddress;
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const uniqueAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Addresses',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.parent;

        // looks up tested value
        let inputValidation = addressValidationMap.current.get(value);
        if (!!value && !inputValidation) {
          inputValidation = (await validateAddress({ signerOrProvider, address: value }))
            .validation;
        }
        // converts all inputs to addresses to compare
        // uses addressValidationMap to save on requests
        const resolvedAddresses: string[] = await Promise.all(
          parentAddressArray.map(async (address: string) => {
            // look up validated values
            const addressValidation = addressValidationMap.current.get(address);
            if (addressValidation && addressValidation.isValidAddress) {
              return addressValidation.address;
            }
            // because mapping is not 'state', this catches values that may not be resolved yet
            if (address && address.endsWith('.eth')) {
              const { validation } = await validateAddress({ signerOrProvider, address });
              return validation.address;
            }
            return address;
          })
        );

        const uniqueFilter = resolvedAddresses.filter(
          address => address === value || address === inputValidation?.address
        );

        return uniqueFilter.length === 1;
      },
    };
  }, [signerOrProvider, t]);

  return {
    addressValidationTest,
    uniqueAddressValidationTest,
  };
};
