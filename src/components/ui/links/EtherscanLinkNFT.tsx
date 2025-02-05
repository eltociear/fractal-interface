import { Link } from '@chakra-ui/next-js';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';

function EtherscanLinkNFT({
  address,
  tokenId,
  children,
}: {
  address: string;
  tokenId: string;
  children: React.ReactNode;
}) {
  const { etherscanBaseURL } = useNetworkConfg();
  return (
    <Link
      href={`${etherscanBaseURL}/${address}/${tokenId}`}
      target="_blank"
    >
      {children}
    </Link>
  );
}

export default EtherscanLinkNFT;
