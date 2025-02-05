import {
  Box,
  Divider,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Hide,
  IconButton,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import { FractalBrandBurger, FractalBrand } from '@decent-org/fractal-ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAOSearch } from '../../menus/DAOSearch';
import { NavigationLinks } from './NavigationLinks';

function Navigation() {
  const { t } = useTranslation('navigation');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const {
    gnosis: {
      safe: { address },
      safeService,
      isGnosisLoading,
    },
  } = useFractal();

  const showDAOLinks = !!address && !!safeService && !isGnosisLoading;
  return (
    <Flex
      alignItems="center"
      direction="column"
      justifyContent="space-between"
      flexGrow={1}
    >
      <Hide above="md">
        <>
          <IconButton
            ref={btnRef}
            onClick={onOpen}
            display="flex"
            boxSize="4rem"
            justifyContent="center"
            alignItems="center"
            aria-label="navigation"
            minW={0}
            variant="unstyled"
            icon={
              <FractalBrandBurger
                aria-hidden
                boxSize="2rem"
              />
            }
          />
          <Drawer
            placement="left"
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            isFullHeight
          >
            <DrawerOverlay />
            <DrawerContent
              bg="chocolate.900"
              border="none"
            >
              <DrawerCloseButton
                size="lg"
                zIndex="banner"
              />

              <Box
                mt={12}
                px={8}
                position="relative"
              >
                <DAOSearch closeDrawer={onClose} />
              </Box>
              <Flex
                alignItems="center"
                direction="column"
                justifyContent={showDAOLinks ? 'space-evenly' : 'flex-start'}
                flexGrow={1}
                overflowY="auto"
                px={8}
                pt={8}
              >
                <Divider color="chocolate.700" />
                <NavigationLinks
                  showDAOLinks={showDAOLinks}
                  address={address}
                  closeDrawer={onClose}
                />
              </Flex>
            </DrawerContent>
          </Drawer>
        </>
      </Hide>
      <Show above="md">
        <Link
          data-testid="navigationLogo-homeLink"
          href={BASE_ROUTES.landing}
          aria-label={t('ariaLabelFractalBrand')}
        >
          <FractalBrand
            aria-hidden
            boxSize="4.25rem"
          />
        </Link>
        <NavigationLinks
          showDAOLinks={showDAOLinks}
          address={address}
        />
      </Show>
    </Flex>
  );
}

export default Navigation;
