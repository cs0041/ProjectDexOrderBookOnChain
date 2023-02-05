import { BigNumber } from 'ethers';
import { ethers } from 'hardhat'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../typechain-types'

// npx hardhat node
// npx hardhat run scripts/deploy.ts --network localhost

// toWei   ->ethers.utils.parseEther
// toEther -> ethers.utils.formatEther
async function main() {

  const initialSupplyToken0 = 10000
  const initialSupplyToken1 = 10000000
  const [owner,addr1,addr2] = await ethers.getSigners();
  console.log(addr2.address)

  // deploy token0
  const TOKEN0 = (await ethers.getContractFactory('Token0', owner )) as Token0__factory
  const token0 = await TOKEN0.deploy(initialSupplyToken0)
  await token0.deployed()
  console.log(`token 0 deploy at address ${token0.address}`)
    
  // deploy token1
  const TOKEN1 = (await ethers.getContractFactory( 'Token1',  owner )) as Token1__factory
  const token1 = await TOKEN1.deploy(initialSupplyToken1)
  await token1.deployed()
  console.log(`token 1 deploy at address ${token1.address}`)

  // deploy PairOrderBook
  const PairOrderBook = (await ethers.getContractFactory( 'PairNewOrder', owner)) as PairNewOrder__factory
  const pairorderbook = await PairOrderBook.deploy(token0.address, token1.address)
  console.log(`PairOrderBook deploy at address ${pairorderbook.address}`)

  // approve 
  await token0.connect(owner).approve(pairorderbook.address,ethers.constants.MaxUint256)
  await token1.connect(owner).approve(pairorderbook.address,ethers.constants.MaxUint256)
  await token0.connect(addr1).approve(pairorderbook.address,ethers.constants.MaxUint256)
  await token1.connect(addr1).approve(pairorderbook.address,ethers.constants.MaxUint256)
  await token0.connect(addr2).approve(pairorderbook.address,ethers.constants.MaxUint256)
  await token1.connect(addr2).approve(pairorderbook.address,ethers.constants.MaxUint256)

  // owner deposit token 
  await pairorderbook.connect(owner).deposit(initialSupplyToken0-2000,token0.address)
  await pairorderbook.connect(owner).deposit(initialSupplyToken1-2000000,token1.address)


  // transfer token to addr1,2
  await token0.connect(owner).transfer(addr1.address,1000)
  await token1.connect(owner).transfer(addr1.address, 1000000)
  await token0.connect(owner).transfer(addr2.address,1000)
  await token1.connect(owner).transfer(addr2.address, 1000000)

  // addr1,2 deposit token 
  await pairorderbook.connect(addr1).deposit(1000, token0.address)
  await pairorderbook.connect(addr1).deposit(1000000, token1.address)
  await pairorderbook.connect(addr2).deposit(1000, token0.address)
  await pairorderbook.connect(addr2).deposit(1000000, token1.address)




  // createLimitOrder

  let price: number
  let amount: number
  let prevNodeID:BigNumber
  let isBuy = 0
  let isSell = 1
  let round = 10

  // buy 
  
  price = 22500
  amount = 5
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)

  price = 21000
  amount = 3
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)

  price = 19000
  amount = 7
  prevNodeID = await pairorderbook._findIndex(price, isBuy)

  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)
  price = 18000
  amount = 8
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)

  price = 17000
  amount = 10
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)

  price = 25000
  amount = 2
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)

  price = 23000
  amount = 3
  prevNodeID = await pairorderbook._findIndex(price, isBuy)
  await pairorderbook.connect(owner).createLimitOrder(isBuy,amount,price,prevNodeID)
  
  // sell

  price = 24500
  amount = 12
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  price = 23000
  amount = 9
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)
 
  price = 25000
  amount = 3
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  price = 30000
  amount = 8
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  price = 27000
  amount = 5
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  price = 32000
  amount = 10
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  price = 45000
  amount = 20
  prevNodeID = await pairorderbook._findIndex(price, isSell)
  await pairorderbook.connect(owner).createLimitOrder(isSell,amount,price,prevNodeID)

  //Market Order
  await pairorderbook.connect(addr1).createMarketOrder(1,2)
  await pairorderbook.connect(addr1).createMarketOrder(1,3)
  await pairorderbook.connect(addr1).createMarketOrder(0,50000)

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

