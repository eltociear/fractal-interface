import { Flex } from '@chakra-ui/react';
import { InfoBox } from '../../../components/ui/containers/InfoBox';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../routes/constants';
import { InfoDAO } from './InfoDAO';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';

export function Info() {
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
  return (
    <Flex
      flexDirection="column"
      minH="10.5rem"
    >
      <Flex
        flexWrap="wrap"
        gap="1rem"
        justifyContent="space-between"
        mb="1rem"
      >
        <InfoBox minWidth={{ sm: '100%', xl: '34.5%', '2xl': '41rem' }}>
          <InfoDAO />
        </InfoBox>
        <InfoBox minWidth={{ sm: '100%', lg: '34.5%', xl: '23.5%', '2xl': '14rem' }}>
          <InfoGovernance />
        </InfoBox>
        <InfoBox
          to={DAO_ROUTES.proposals.relative(address)}
          minWidth={{ sm: '100%', lg: '32%', xl: '21%', '2xl': '10rem' }}
        >
          <InfoProposals />
        </InfoBox>
        <InfoBox
          to={DAO_ROUTES.treasury.relative(address)}
          minWidth={{ sm: '100%', lg: '30%', xl: '15%', '2xl': '9rem' }}
        >
          <InfoTreasury />
        </InfoBox>
      </Flex>
    </Flex>
  );
}
