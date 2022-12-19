import { Box, Grid, Text, Button, NumberInput, NumberInputField } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { TokenAllocation } from '../../../types/tokenAllocation';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';
import { BigNumberInput } from '../provider/types';
import TokenAllocationInput from './TokenAllocationInput';

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[];
  supply: BigNumber | null;
  parentAllocationAmount?: BigNumberInput;
  canReceiveParentAllocations: boolean;
  fieldUpdate: (value: any, field: string) => void;
}

function TokenAllocations({
  tokenAllocations,
  supply,
  parentAllocationAmount,
  canReceiveParentAllocations,
  fieldUpdate,
}: TokenAllocationsProps) {
  const [hasAmountError, setAmountError] = useState(false);

  const { limitDecimalsOnKeyDown } = useFormHelpers();

  const updateTokenAllocation = useCallback(
    (
      index: number,
      snapShotTokenAllocations: TokenAllocation[],
      tokenAllocation: TokenAllocation
    ) => {
      const newTokenAllocations = [...snapShotTokenAllocations];
      newTokenAllocations[index] = { ...tokenAllocation };
      fieldUpdate(newTokenAllocations, 'tokenAllocations');
    },
    [fieldUpdate]
  );

  const addTokenAllocation = () => {
    if (tokenAllocations === undefined) {
      fieldUpdate([{ address: '', amount: { value: '', valueBN: null } }], 'tokenAllocations');
      return;
    }
    fieldUpdate(
      [
        ...tokenAllocations,
        {
          address: '',
          amount: BigNumber.from(0),
        },
      ],
      'tokenAllocations'
    );
  };

  const removeTokenAllocation = (updatedTokenAllocations: TokenAllocation[]) => {
    if (tokenAllocations === undefined) return;
    fieldUpdate(updatedTokenAllocations, 'tokenAllocations');
  };

  const onParentAllocationChange = (value: string) => {
    fieldUpdate(
      { value, bigNumberValue: utils.parseUnits(value || '0', DEFAULT_TOKEN_DECIMALS) },
      'parentAllocationAmount'
    );
  };

  useEffect(() => {
    const totalAllocated = tokenAllocations
      .map(tokenAllocation => tokenAllocation.amount.bigNumberValue || BigNumber.from(0))
      .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
    if (supply && supply.gt(0)) {
      // no DAO token allocation with no parent allocations
      if (
        totalAllocated.gt(0) &&
        (!parentAllocationAmount?.bigNumberValue || parentAllocationAmount.bigNumberValue.lte(0))
      ) {
        setAmountError(supply.lt(totalAllocated));
        // parent tokens allocated but no DAO token allocation
      } else if (
        parentAllocationAmount?.bigNumberValue &&
        totalAllocated.lte(0) &&
        parentAllocationAmount.bigNumberValue?.gt(0)
      ) {
        setAmountError(supply.lt(parentAllocationAmount.bigNumberValue));
        // parent tokens allocated with DAO token allocation
      } else if (
        parentAllocationAmount?.bigNumberValue &&
        totalAllocated.gt(0) &&
        parentAllocationAmount.bigNumberValue?.gt(0)
      ) {
        setAmountError(supply.lt(totalAllocated.add(parentAllocationAmount.bigNumberValue)));
      } else {
        // no allocation set amount error to false
        setAmountError(false);
      }
    }
  }, [tokenAllocations, supply, parentAllocationAmount]);

  const { t } = useTranslation('daoCreate');

  return (
    <Box>
      {/* @todo add translations */}
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      {canReceiveParentAllocations && !!parentAllocationAmount && (
        <InputBox>
          <LabelWrapper
            label={t('labelParentAllocation')}
            subLabel={t('helperParentAllocation')}
            errorMessage={hasAmountError ? t('errorOverallocated') : ''}
          >
            <NumberInput
              isInvalid={hasAmountError}
              data-testid="tokenVoting-parentTokenAllocationInput"
              value={parentAllocationAmount.value}
              onChange={onParentAllocationChange}
              onKeyDown={e =>
                limitDecimalsOnKeyDown(e, parentAllocationAmount.value, DEFAULT_TOKEN_DECIMALS)
              }
            >
              <NumberInputField />
            </NumberInput>
          </LabelWrapper>
        </InputBox>
      )}
      <InputBox>
        <Grid
          gridTemplateColumns="1fr max-content 5rem"
          gap="2"
          data-testid="tokenVoting-tokenAllocations"
        >
          <Text
            textStyle="text-base-sans-bold"
            color="grayscale.500"
          >
            {t('titleAddress')}
          </Text>
          <Text
            textStyle="text-base-sans-bold"
            color="grayscale.500"
          >
            {t('titleAmount')}
          </Text>
          <Box>{/* EMPTY */}</Box>
          {tokenAllocations &&
            tokenAllocations.map((tokenAllocation, index) => (
              <TokenAllocationInput
                key={index}
                index={index}
                hasAmountError={hasAmountError}
                tokenAllocation={tokenAllocation}
                tokenAllocations={tokenAllocations}
                updateTokenAllocation={updateTokenAllocation}
                removeTokenAllocation={removeTokenAllocation}
              />
            ))}
        </Grid>
        <Button
          size="base"
          maxWidth="fit-content"
          px="0px"
          mx="0px"
          variant="text"
          onClick={() => addTokenAllocation()}
          data-testid="tokenVoting-addAllocation"
        >
          {t('labelAddAllocation')}
        </Button>
      </InputBox>
    </Box>
  );
}

export default TokenAllocations;
