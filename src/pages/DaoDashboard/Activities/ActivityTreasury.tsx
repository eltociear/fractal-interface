import { Button, Flex, Text } from '@chakra-ui/react';
import { SquareSolidArrowDown, ArrowAngleUp, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EtherscanLinkAddress from '../../../components/ui/EtherscanLinkAddress';
import useDisplayName from '../../../hooks/useDisplayName';
import { Activity } from '../../../types';
import { AcitivityCard } from './ActivityCard';

function ActivityAddress({ address }: { address: string }) {
  const { displayName } = useDisplayName(address);
  return <Text>{displayName}</Text>;
}

function ActivityDescription({
  transferTypeStr,
  transferDirStr,
  totalAmounts,
  transferAddresses,
}: {
  transferTypeStr: string;
  transferDirStr: string;
  totalAmounts: string[];
  transferAddresses: string[];
}) {
  return (
    <Flex
      color="grayscale.100"
      textStyle="text-lg-mono-semibold"
      gap="0.5rem"
    >
      <Text>{transferTypeStr}</Text>
      <Text>{totalAmounts.join(', ')}</Text>
      <Text>{transferDirStr}</Text>
      {transferAddresses.length > 2 ? (
        <Text>{transferAddresses.length} addresses</Text>
      ) : (
        transferAddresses.map((address, i) => (
          <ActivityAddress
            key={address + i}
            address={address}
          />
        ))
      )}
    </Flex>
  );
}

interface IActivityTreasury {
  asset: Activity;
}

export function ActivityTreasury({ asset }: IActivityTreasury) {
  const { t } = useTranslation();
  const transferTypeStr = useMemo(() => {
    return asset.isDeposit ? t('received') : t('sent');
  }, [asset, t]);
  const transferDirStr = useMemo(() => {
    return asset.isDeposit ? t('from') : t('to');
  }, [asset, t]);

  return (
    <AcitivityCard
      Badge={
        asset.isDeposit ? (
          <SquareSolidArrowDown color="sand.700" />
        ) : (
          <SquareSolidArrowUp color="sand.700" />
        )
      }
      description={
        <ActivityDescription
          transferAddresses={asset.transferAddresses}
          transferTypeStr={transferTypeStr}
          transferDirStr={transferDirStr}
          totalAmounts={asset.transferAmountTotals}
        />
      }
      RightElement={
        <EtherscanLinkAddress
          path="tx"
          address={asset.transaction.txHash}
        >
          <Button
            variant="text"
            size="lg"
            px="0px"
            rightIcon={<ArrowAngleUp boxSize="1.5rem" />}
          >
            {t('labelEtherscan')}
          </Button>
        </EtherscanLinkAddress>
      }
      eventDate={asset.eventDate}
    />
  );
}
