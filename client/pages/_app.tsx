import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { polygonMumbai ,optimismGoerli} from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import '@rainbow-me/rainbowkit/styles.css'
import {
  ConnectButton,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { Chain } from 'wagmi/chains'
const hardhat: Chain = {
  id: 31337,
  name: 'Hardhat',
  network: 'Harthat at http://127.0.0.1:8545/',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'Eth',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545/'],
    },
  },
  testnet: true,
}

const { chains, provider } = configureChains(
  [hardhat],
  [
    alchemyProvider({ apiKey: '' }),
    infuraProvider({ apiKey: '' }),
    publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'My app',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default MyApp
