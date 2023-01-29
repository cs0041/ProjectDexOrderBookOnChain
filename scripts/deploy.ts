import { BigNumber } from 'ethers';
import { ethers } from 'hardhat'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../typechain-types'

// npx hardhat node
// npx hardhat run scripts/deploy.ts --network localhost

// wei   ->ethers.utils.parseEther
// ether -> ethers.utils.formatEther
async function main() {
  
  const initialSupply = ethers.utils.parseEther('100000')

  const [owner,signer1] = await ethers.getSigners();

  // deploy token0
  const TOKEN0 = (await ethers.getContractFactory('Token0', owner )) as Token0__factory
  const token0 = await TOKEN0.deploy(initialSupply)
  await token0.deployed()
  console.log(`token 0 deploy at address ${token0.address}`)
    
  // deploy token1
  const TOKEN1 = (await ethers.getContractFactory( 'Token1',  owner )) as Token1__factory
  const token1 = await TOKEN1.deploy(initialSupply)
  await token1.deployed()
  console.log(`token 1 deploy at address ${token1.address}`)

  // deploy PairOrderBook
  const PairOrderBook = (await ethers.getContractFactory( 'PairNewOrder', owner)) as PairNewOrder__factory
  const pairorderbook = await PairOrderBook.deploy(token0.address, token1.address)
  console.log(`PairOrderBook deploy at address ${pairorderbook.address}`)

  // approve 
  await token0.connect(owner).approve(pairorderbook.address,initialSupply)
  await token1.connect(owner).approve(pairorderbook.address,initialSupply)

  // deposit token 
  await pairorderbook.connect(owner).deposit(initialSupply,token0.address)
  await pairorderbook.connect(owner).deposit(initialSupply,token1.address)

  // createLimitOrder

  let price: BigNumber
  let amount: BigNumber
  let prevNodeID:BigNumber
  let isBuy = 0
  let isSell = 1
  let round = 10
  // OrderBuy -> buy 5 token0 at price 10
  price = ethers.utils.parseEther('10')
  amount = ethers.utils.parseEther('5')
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)
  // OrderBuy -> buy 20 token0 at price 15
  price = ethers.utils.parseEther('15')
  amount = ethers.utils.parseEther('20')
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)
  // OrderBuy -> buy 15 token0 at price 30
  price = ethers.utils.parseEther('30')
  amount = ethers.utils.parseEther('15')
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)


  // for (let i = 0; i < round; i++) {
  //    // price random  from 1 to 100
  //    price =   ethers.utils.parseEther(String( Math.floor(Math.random() * 100) + 1 )) 
  //    // amount random  from 1 to 20
  //    price =   ethers.utils.parseEther(String( Math.floor(Math.random() * 20) + 1 )) 
  //    prevNodeID = await pairorderbook._findIndex(price, isBuy)
  //    await pairorderbook
  //      .connect(owner)
  //      .createLimitOrder(isBuy, amount, price, prevNodeID)
     
  //  }

    
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

