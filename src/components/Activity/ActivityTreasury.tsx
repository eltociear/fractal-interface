import { Button } from '@chakra-ui/react';
import { SquareSolidArrowDown, ArrowAngleUp, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TreasuryActivity, ActivityEventType } from '../../types';
import { DEFAULT_DATE_FORMAT } from '../../utils/numberFormats';
import EtherscanLinkAddress from '../ui/links/EtherscanLinkAddress';
import { ActivityCard } from './ActivityCard';
import { ActivityDescription } from './ActivityDescription';

export function ActivityTreasury({ activity }: { activity: TreasuryActivity }) {
  const { t } = useTranslation();
  const {
    gnosis: { safe },
  } = useFractal();
  const eventDateLabel = t(
    activity.eventType === ActivityEventType.Treasury
      ? activity.transaction?.to === safe.address
        ? 'received'
        : 'sent'
      : 'created'
  );

  return (
    <ActivityCard
      Badge={
        activity.isDeposit ? (
          <SquareSolidArrowDown color="sand.700" />
        ) : (
          <SquareSolidArrowUp color="sand.700" />
        )
      }
      description={<ActivityDescription activity={activity} />}
      RightElement={
        activity.transactionHash ? (
          <EtherscanLinkAddress
            path="tx"
            address={activity.transactionHash}
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
        ) : undefined
      }
      eventDate={format(activity.eventDate, DEFAULT_DATE_FORMAT)}
      eventDateLabel={eventDateLabel}
    />
  );
}
