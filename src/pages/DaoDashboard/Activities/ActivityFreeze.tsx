import { Flex, Text, Button, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badges/Badge';
import useCurrentBlockNumber from '../../../hooks/utils/useCurrentBlockNumber';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { AcitivityCard } from './ActivityCard';
import { FreezeDescription } from './ActivityDescription';

export function ActivityFreeze() {
  const { t } = useTranslation('dashboard');

  const {
    gnosis: { guard },
  } = useFractal();
  console.log(guard);
  // const currentBlock = await useCurrentBlockNumber()
  // const freezeProposalDaysLeft = currentBlock?.sub(guard.freezeProposalCreatedBlock.add(guard.freezeProposalBlockDuration)) / blocks in a day
  // check isFreezeInit
  // check isFrozen
  // check userHasFreezeVoted
  // check userCanFreezeVote
  // update button during Frozen state / already voted stage

  return (
    <AcitivityCard
      Badge={
        <Badge
          labelKey={guard.isFrozen ? 'stateFrozen' : 'stateFreezeInit'}
          size="base"
        />
      }
      description={<FreezeDescription isFrozen={guard.isFrozen} />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            <Tooltip
              label={
                guard.freezeProposalVoteCount.toString() +
                ' / ' +
                guard.freezeVotesThreshold.toString() +
                t('tipFreeze')
              }
              placement="bottom"
            >
              {guard.freezeProposalVoteCount.toString() +
                ' / ' +
                guard.freezeVotesThreshold.toString()}
            </Tooltip>
          </Text>
          <Text textStyle="text-base-sans-regular">{t('freezeDaysLeft')}</Text>
          <Button
            variant="ghost"
            bgColor={'black.900'}
            border="1px"
            borderColor={'blue.500'}
            textColor={'blue.500'}
            onClick={() => {}}
            disabled={guard.isFrozen || guard.userHasFreezeVoted}
          >
            {t('freezeButton')}
          </Button>
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
