import 'hardhat-deploy'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import "@nomiclabs/hardhat-waffle"
import { HardhatUserConfig } from 'hardhat/types'
import 'hardhat-gas-reporter'

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: '0.8.9',
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    // coinmarketcap: 'apikey',
    token:"MATIC"
  },
}


export default config
