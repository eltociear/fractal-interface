import { Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { BigNumberInput, BigNumberValuePair } from '../../ui/BigNumberInput';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import TokenAllocations from './TokenAllocations';

function TokenDetails() {
  const {
    state: { govToken },
    dispatch,
  } = useCreator();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN,
      payload: {
        [field]: value,
      },
    });
  };

  const onSupplyChange = (value: BigNumberValuePair) => {
    fieldUpdate(value.bigNumberValue, 'tokenSupply');
  };

  const { t } = useTranslation('daoCreate');

  return (
    <ContentBox>
      <ContentBoxTitle>{t('titleTokenParams')}</ContentBoxTitle>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenName')}
          subLabel={t('helperTokenName')}
        >
          <Input
            data-testid="tokenVoting-tokenNameInput"
            value={govToken.tokenName}
            onChange={e => fieldUpdate(e.target.value, 'tokenName')}
            minWidth="50%"
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenSymbol')}
          subLabel={t('helperTokenSymbol')}
        >
          <Input
            data-testid="tokenVoting-tokenSymbolInput"
            value={govToken.tokenSymbol}
            onChange={e => fieldUpdate(e.target.value, 'tokenSymbol')}
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenSupply')}
          subLabel={t('helperTokenSupply')}
        >
          <BigNumberInput
            data-testid="tokenVoting-tokenSupplyInput"
            value={govToken.tokenSupply}
            onChange={onSupplyChange}
            decimalPlaces={0}
          />
        </LabelWrapper>
      </InputBox>
      <TokenAllocations
        tokenAllocations={govToken.tokenAllocations}
        supply={govToken.tokenSupply}
        parentAllocationAmount={govToken.parentAllocationAmount}
        // @todo parent allocations should be reenabled when code is implemented
        canReceiveParentAllocations={false}
        fieldUpdate={fieldUpdate}
      />
    </ContentBox>
  );
}

export default TokenDetails;
