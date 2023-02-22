import { Box, ComponentWithAs, Hide, IconProps, Show, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../routes/constants';
import { NavigationTooltip } from './NavigationTooltip';

interface INavigationLink {
  to: string;
  labelKey: string;
  testId: string;
  routeKey?: string;
  Icon: ComponentWithAs<'svg', IconProps>;
  target?: string;
  rel?: string;
}

export function NavigationLink({ labelKey, testId, Icon, routeKey, ...rest }: INavigationLink) {
  const { t } = useTranslation('sidebar');
  const patternString = !routeKey
    ? ''
    : routeKey === 'dao'
    ? 'daos/:address'
    : `daos/:address/${DAO_ROUTES[routeKey].path}/*`;
  const match = useMatch(patternString);

  const activeColors = useCallback(() => {
    let isActive = !!match;
    return {
      color: isActive ? 'gold.500' : 'inherit',
      _hover: {
        color: isActive ? 'gold.500-hover' : 'inherit',
      },
    };
  }, [match]);

  return (
    <NavigationTooltip label={t(labelKey)}>
      <Link
        data-testid={testId}
        aria-label={t(labelKey)}
        {...rest}
      >
        <Box
          display={{ base: 'flex', md: undefined }}
          gap={8}
          justifyContent="space-between"
          alignItems="center"
        >
          <Icon
            boxSize={{ base: '2.5rem', md: '1.5rem' }}
            {...activeColors()}
          />
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(labelKey)}</Text>
          </Hide>
        </Box>
      </Link>
    </NavigationTooltip>
  );
}
