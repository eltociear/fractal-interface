import { Text, NumberInput, NumberInputField } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions, TrustedAddress } from '../provider/types';
import { GnosisSignatures } from './GnosisSignature';

export function GnosisConfig() {
  const {
    state: {
      gnosis: { trustedAddresses, signatureThreshold },
    },
    dispatch,
  } = useCreator();
  const [thresholdError, setThresholdError] = useState('');
  const [numberOfSigners, setNumberOfSigners] = useState<number>(trustedAddresses.length);

  const { restrictChars } = useFormHelpers();

  const fieldUpdate = (value: TrustedAddress[] | string, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GNOSIS_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };

  const handleSignersChanges = (numberStr: string) => {
    let numOfSigners = Number(numberStr);
    if (numOfSigners > 999) return;
    if (trustedAddresses.length !== numOfSigners) {
      const gnosisAddresses = [...trustedAddresses];
      const trustedAddressLength = trustedAddresses.length;
      if (numOfSigners > trustedAddressLength) {
        const difference = numOfSigners - trustedAddressLength;
        gnosisAddresses.push(...new Array(difference).fill({ address: '', error: false }));
      }
      if (numOfSigners < trustedAddressLength) {
        const difference = trustedAddressLength - numOfSigners;
        gnosisAddresses.splice(trustedAddressLength - difference, difference + 1);
      }
      fieldUpdate(gnosisAddresses, 'trustedAddresses');
    }
    setNumberOfSigners(numOfSigners);
  };

  const removeAddress = (index: number) => {
    const gnosisAddresses = trustedAddresses.filter((_, i) => i !== index);
    setNumberOfSigners(gnosisAddresses.length);
    fieldUpdate(gnosisAddresses, 'trustedAddresses');
  };

  const updateAddresses = (addresses: TrustedAddress[]) => {
    fieldUpdate(addresses, 'trustedAddresses');
  };

  const updateThreshold = (threshold: string) => {
    fieldUpdate(threshold, 'signatureThreshold');
  };

  const { t } = useTranslation('daoCreate');

  useEffect(() => {
    let error: string = '';
    if (Number(signatureThreshold) === 0) {
      error = t('errorLowSignerThreshold');
    }
    if (Number(signatureThreshold) > numberOfSigners) {
      error = t('errorHighSignerThreshold');
    }

    setThresholdError(error);
  }, [signatureThreshold, numberOfSigners, t]);

  return (
    <ContentBox>
      <ContentBoxTitle>{t('titleCreateGnosis')}</ContentBoxTitle>
      <InputBox>
        <LabelWrapper
          label={t('labelSigThreshold')}
          subLabel={t('helperSigThreshold')}
          errorMessage={thresholdError}
        >
          <NumberInput
            value={signatureThreshold}
            onChange={updateThreshold}
            data-testid="gnosisConfig-thresholdInput"
            onKeyDown={restrictChars}
          >
            <NumberInputField />
          </NumberInput>
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('helperSigners')}
          subLabel={t('helperSigners')}
        >
          <NumberInput
            value={numberOfSigners}
            onChange={handleSignersChanges}
            data-testid="gnosisConfig-numberOfSignerInput"
            onKeyDown={restrictChars}
          >
            <NumberInputField />
          </NumberInput>
        </LabelWrapper>
      </InputBox>

      <ContentBoxTitle>{t('titleTrustedAddresses')}</ContentBoxTitle>
      <Text
        textStyle="text-sm-sans-medium"
        my="0.25rem"
        color="chocolate.100"
        className="text-gray-50 text-xs font-medium my-4"
      >
        {t('subTitleTrustedAddresses')}
      </Text>
      <InputBox data-testid="gnosisConfig-signatureList">
        {trustedAddresses.map((trustee, i) => (
          <GnosisSignatures
            key={i}
            trustee={trustee}
            index={i}
            updateAddresses={updateAddresses}
            removeAddress={removeAddress}
          />
        ))}
      </InputBox>
    </ContentBox>
  );
}
