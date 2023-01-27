import {PairNewOrder,PairNewOrder__factory,TestToken,TestToken__factory} from '../typechain-types'
// @ts-ignore
import { ethers } from 'hardhat'
import { assert, expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
describe("PairOrderBook",async () => {
  let pairorderbook: PairNewOrder
  let token0: TestToken
  let token1: TestToken
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  const initialSupply = 1000 // initialSupply Token

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners()

    const TOKEN0 = (await ethers.getContractFactory('TestToken', owner )) as TestToken__factory
    token0 = await TOKEN0.deploy(initialSupply)
    
    const TOKEN1 = (await ethers.getContractFactory( 'TestToken',  owner )) as TestToken__factory
    token1 = await TOKEN1.deploy(initialSupply)

    const PairOrderBook = (await ethers.getContractFactory( 'PairNewOrder', owner)) as PairNewOrder__factory
    pairorderbook = await PairOrderBook.deploy(token0.address, token1.address)

    // approve
    await token0.connect(owner).approve(pairorderbook.address,initialSupply)
    await token1.connect(owner).approve(pairorderbook.address,initialSupply)

    // deposit token 
    await pairorderbook.connect(owner).deposit(initialSupply,token0.address)
    await pairorderbook.connect(owner).deposit(initialSupply,token1.address)


  })

  describe('CreateLimitOrder',async () => {
     it(' Should revert when deposit and sufficient balance' , async () => {
        await expect(pairorderbook.connect(owner).deposit(1, token0.address)).to.be.revertedWith("balance not sufficient")
     })
     it(' Should pass when deposit and enough balance' , async () => {
        expect(await pairorderbook.balancesSpot(owner.address,token0.address) ).to.be.equal(1000)
     })

     it(' Should revert when create order buy and balancesSpot not sufficient ', async () => {
        let price: number
        let prevNodeID: BigNumber
        let isBuy = 0
        let amount = 1 

        price = 3000
        prevNodeID = await pairorderbook._findIndex(price, isBuy)
        await expect( pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)).to.be.revertedWith("not enough balance token for buy")
     })

     it(' Should revert when create order sell and balancesSpot not sufficient ', async () => {
        let price: number
        let prevNodeID: BigNumber
        let isSell = 1
        let amount = 1001

        price = 9999
        prevNodeID = await pairorderbook._findIndex(price, isSell)
        await expect( pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,prevNodeID)).to.be.revertedWith("not enough balance token for sell")
     })

     it(' Should order when create 10 Order buy', async  () => {

      let price:number
      let prevNodeID:BigNumber
      let isBuy = 0

      // order 1  -> price 1 buy
      price = 1
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 2  -> price 2 buy
      price = 2
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)
    

      // order 3  -> price 5 buy
      price = 5
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 4  -> price 4 buy
      price = 4
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 5  -> price 6 buy
      price = 6
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 6  -> price 3 buy
      price = 3
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 7  -> price 10 buy
      price = 10
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 8  -> price 7 buy
      price = 7
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 9  -> price 9 buy
      price = 9
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      // order 10  -> price 8 buy
      price = 8
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,1,price,prevNodeID)

      //  1 2 5 4 6 3 10 7 9 8
      //const dataOrder = await pairorderbook.getOrderBook(0)
      // console.log(dataOrder.toString())


      expect(await pairorderbook.getOrderBook(0)).to.deep.equal([
        ethers.BigNumber.from(10),
        ethers.BigNumber.from(9),
        ethers.BigNumber.from(8),
        ethers.BigNumber.from(7),
        ethers.BigNumber.from(6),
        ethers.BigNumber.from(5),
        ethers.BigNumber.from(4),
        ethers.BigNumber.from(3),
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(1),
      ])

      expect(await pairorderbook.getOrderBook(1)).to.deep.equal([])
    

     })
  })
})