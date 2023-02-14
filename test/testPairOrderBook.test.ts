import {
  PairNewOrder,
  PairNewOrder__factory,
  Token0,
  Token0__factory,
  Token1,
  Token1__factory,
} from '../typechain-types'
// @ts-ignore
import { ethers } from 'hardhat'
import { assert, expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { orderToList } from './helper/OrderToList'
import { FindSum } from './helper/FindSum'


const toWei = (ether: string | number) => ethers.utils.parseEther(String(ether))
const toEther = (wei: string | number | ethers.BigNumber) =>
  ethers.utils.formatEther(wei)
const toFixUnits = (amount: number, decimal: string) =>
  ethers.utils.formatUnits(amount, decimal)
const toEtherandFixFloatingPoint = (amount: ethers.BigNumber) =>
  Number(ethers.utils.formatEther(amount)).toFixed(6)

describe('PairNewOrder', async () => {
  let pairorderbook: PairNewOrder
  let token0: Token0
  let token1: Token1
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  const initialSupply = toWei(1000) // initialSupply Token

  beforeEach(async () => {
    ;[owner, addr1] = await ethers.getSigners()

    const TOKEN0 = (await ethers.getContractFactory(
      'Token0',
      owner
    )) as Token0__factory
    token0 = await TOKEN0.deploy(initialSupply)

    const TOKEN1 = (await ethers.getContractFactory(
      'Token1',
      owner
    )) as Token1__factory
    token1 = await TOKEN1.deploy(initialSupply)

    const PairOrderBook = (await ethers.getContractFactory(
      'PairNewOrder',
      owner
    )) as PairNewOrder__factory
    pairorderbook = await PairOrderBook.deploy(token0.address, token1.address)

    // approve
    await token0.connect(owner).approve(pairorderbook.address, initialSupply)
    await token1.connect(owner).approve(pairorderbook.address, initialSupply)

    // deposit token
    await pairorderbook.connect(owner).deposit(initialSupply, token0.address)
    await pairorderbook.connect(owner).deposit(initialSupply, token1.address)
  })

  describe('CreateLimitOrder', async () => {
    it(' Should revert when Order Buy/Sell and input amount = 0 ', async () => {
      let price = 1
      let amount = 0
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await expect(
        pairorderbook
          .connect(owner)
          .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      ).to.be.revertedWith('amount must > 0')

      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await expect(
        pairorderbook
          .connect(owner)
          .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      ).to.be.revertedWith('amount must > 0')
    })

    it(' Should revert when Order Buy/Sell and input price = 0 ', async () => {
      let price = 0
      let amount = 1
      let isBuy = 0
      let isSell = 1

      await expect(pairorderbook._findIndex(price, isBuy)).to.be.revertedWith(
        'price must > 0'
      )
      await expect(
        pairorderbook.connect(owner).createLimitOrder(isBuy, amount, price, 1)
      ).to.be.revertedWith('price must > 0')

      await expect(pairorderbook._findIndex(price, isSell)).to.be.revertedWith(
        'price must > 0'
      )
      await expect(
        pairorderbook.connect(owner).createLimitOrder(isSell, amount, price, 1)
      ).to.be.revertedWith('price must > 0')
    })

    it(' Should revert when create Order Buy/Sell and balancesSpot not sufficient ', async () => {
      let price: number
      let amount: number
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      amount = 1
      price = 1001
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await expect(
        pairorderbook
          .connect(owner)
          .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      ).to.be.revertedWith('not enough balance token for buy')

      amount = 1001
      price = 1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await expect(
        pairorderbook
          .connect(owner)
          .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      ).to.be.revertedWith('not enough balance token for sell')
    })

    it(' Should order when create 5 Order buy', async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // buy price 100
      price = 100
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 300
      price = 300
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 150
      price = 150
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 101.42
      price = 101.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 99.67
      price = 99.67
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      //cheack OrderBook
      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([
        toWei(300),
        toWei(150),
        toWei(101.42),
        toWei(100),
        toWei(99.67),
      ])

      //empty
      expect(await pairorderbook.getOrderBook(isSell)).to.deep.equal([])

      // cheack balancesSpot and balancesTrade 1
      let spot1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      let trade1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )
      expect(spot1).to.be.equal(initialSupply.sub(trade1))
      expect(trade1).to.be.equal(initialSupply.sub(spot1))

      // cheack balancesSpot and balancesTrade 0
      let spot0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      let trade0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )
      expect(spot0).to.be.equal(initialSupply)
      expect(trade0).to.be.equal(0)
    })

    it(' Should order when create 5 Order sell', async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // Sell price 52.24
      price = 52.24
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 195.23
      price = 195.23
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 152.51
      price = 152.51
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 11.42
      price = 11.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 9.1
      price = 9.1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      //cheack OrderBook

      expect(
        orderToList(await pairorderbook.getOrderBook(isSell))
      ).to.deep.equal([
        toWei(9.1),
        toWei(11.42),
        toWei(52.24),
        toWei(152.51),
        toWei(195.23),
      ])

      //empty
      expect(await pairorderbook.getOrderBook(isBuy)).to.deep.equal([])

      // cheack balancesSpot and balancesTrade 1
      let spot1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      let trade1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )
      expect(spot1).to.be.equal(initialSupply)
      expect(trade1).to.be.equal(0)

      // cheack balancesSpot and balancesTrade 0
      let spot0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      let trade0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )
      expect(spot0).to.be.equal(initialSupply.sub(trade0))
      expect(trade0).to.be.equal(initialSupply.sub(spot0))
    })

    it(' Should order when create 5 Order buy and 5 Order sell', async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1
      let round = 10

      // buy price 100
      price = 100
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 300
      price = 300
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 52.24
      price = 52.24
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 195.23
      price = 195.23
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 150
      price = 150
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 101.42
      price = 101.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 152.51
      price = 152.51
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 11.42
      price = 11.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 99.67
      price = 99.67
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 9.1
      price = 9.1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      //cheack OrderBook
      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([
        toWei(100),
        toWei(99.67),
      ])
  
      expect(
        orderToList(await pairorderbook.getOrderBook(isSell))
      ).to.deep.equal([
        toWei(152.51),
        toWei(195.23),
      ])

      // cheack balancesSpot and balancesTrade 1
      let spot1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      let trade1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )
      expect(spot1).to.be.equal(initialSupply.sub(trade1))
      expect(trade1).to.be.equal(initialSupply.sub(spot1))

      // cheack balancesSpot and balancesTrade 0
      let spot0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      let trade0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )
      expect(spot0).to.be.equal(initialSupply.sub(trade0))
      expect(trade0).to.be.equal(initialSupply.sub(spot0))
    })
  })

  describe('RemoveOrder', async () => {
    beforeEach(async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // buy price 100
      price = 100
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 300
      price = 300
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 52.24
      price = 52.24
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 195.23
      price = 195.23
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 150
      price = 150
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 101.42
      price = 101.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 152.51
      price = 152.51
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 11.42
      price = 11.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 99.67
      price = 99.67
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 9.1
      price = 9.1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      //BUY 100(index1)  99.67(index5)
      //SELL 152.51(index2) 195.23(index1)
    })

    it('Should revert when RemoveOrder and index not exist', async () => {
      let isBuy = 0
      let index = 6 // not exist -> orderBUY 100(index1)  99.67(index5)

      await expect(
        pairorderbook._findPrevOrder(isBuy, index)
      ).to.be.revertedWith('_findPrevOrder not exist')
      await expect(
        pairorderbook.connect(owner).removeOrder(isBuy, index, 12)
      ).to.be.revertedWith('you are not owner of this position order') // cause owner is address0
    })
    it('Should revert when RemoveOrder and index-preindex are not contiguous', async () => {
      let prevIndex: BigNumber
      let isBuy = 0
      let index = 1 // orderBUY 100(index1)  99.67(index5)

      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      prevIndex = prevIndex.add(1) // add to make revertedWith("index is not pre")
      await expect(
        pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)
      ).to.be.revertedWith('index is not pre')
    })

    it('Should revert when RemoveOrder and not owner  position order', async () => {
      let prevIndex: BigNumber
      let isBuy = 0
      let index = 5 // orderBUY 100(index1)  99.67(index5)

      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await expect(
        pairorderbook.connect(addr1).removeOrder(isBuy, index, prevIndex)
      ).to.be.revertedWith('you are not owner of this position order')
    })
    it('Should revert when RemoveOrder and empty linked list', async () => {
      let prevIndex: BigNumber
      let isBuy = 0
      let index: number // orderBUY 100(index1)  99.67(index5)

      index = 1
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      index = 5
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      // now empty linked list
      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([])

      // try remove empty linked list
      await expect(
        pairorderbook.connect(owner).removeOrder(isBuy, index, 3)
      ).to.be.revertedWith('index not exist')
    })

    it('Should pass when RemoveOrder and index-preindex are contiguous and exist', async () => {
      let prevIndex: BigNumber
      let balancesSpotToken1: BigNumber
      let balancesTradeToken1: BigNumber
      let balancesSpotToken0: BigNumber
      let balancesTradeToken0: BigNumber
      let index: number
      let isSell = 1 //orderSELL 152.51(index2) 195.23(index1)

      let isBuy = 0 // orderBUY 100(index1)  99.67(index5)

      // remove  orderBUY
      balancesSpotToken1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      balancesTradeToken1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )

      balancesSpotToken0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      balancesTradeToken0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )

      index = 5 // index(5)  99.67
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      // when remove  orderBUY   100(index1)  99.67(index5) --remove(index5)-->   100

      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([toWei(100)])

      // cheack balancesSpot and balancesTrade
      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1.add(toWei(99.67)))
      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1.sub(toWei(99.67)))

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0)
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0)

      // remove  orderSELL

      balancesSpotToken1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      balancesTradeToken1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )

      balancesSpotToken0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      balancesTradeToken0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )

      index = 2 // index(2)  152.51
      prevIndex = await pairorderbook._findPrevOrder(isSell, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isSell, index, prevIndex)

      // when remove  orderSELL 152.51(index2) 195.23(index1) --remove(index2)-->   195.23(index1)

      expect(
        orderToList(await pairorderbook.getOrderBook(isSell))
      ).to.deep.equal([toWei(195.23)])

      // cheack balancesSpot and balancesTrade
      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1)
      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1)

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0.add(toWei(1)))
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0.sub(toWei(1)))
    })
  })

  describe('UpdateOrder', async () => {
    beforeEach(async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // buy price 100
      price = 100
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 300
      price = 300
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 52.24
      price = 52.24
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 195.23
      price = 195.23
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 150
      price = 150
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 101.42
      price = 101.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 152.51
      price = 152.51
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 11.42
      price = 11.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 99.67
      price = 99.67
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 9.1
      price = 9.1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(owner)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      //BUY 100(index1)  99.67(index5)
      //SELL 152.51(index2) 195.23(index1)
    })

    it('Should revert when UpdateOrder and index not exist', async () => {
      let isBuy = 0
      let newPrice = 912
      let newAmount = 1
      let index = 6 // not exist -> orderBUY  100(index1)  99.67(index5)
      let prevIndexAdd = BigNumber.from(7)
      let prevIndexRemove = BigNumber.from(8)

      await expect(
        pairorderbook._findPrevOrder(isBuy, index)
      ).to.be.revertedWith('_findPrevOrder not exist')
      await expect(
        pairorderbook
          .connect(owner)
          .updateOrder(
            isBuy,
            index,
            newPrice,
            newAmount,
            prevIndexAdd,
            prevIndexRemove
          )
      ).to.be.revertedWith('updateOrder index not exist') // cause owner is address0
    })
    it('Should revert when UpdateOrder and index/prevIndexRemove/prevIndexAdd not exist', async () => {
      let isBuy = 0
      let newPrice = 912
      let newAmount = 1
      let index = 3 //  orderBUY  100(index1)  99.67(index5)
      let prevIndexAdd = BigNumber.from(9)
      let prevIndexRemove = BigNumber.from(12)

      await expect(pairorderbook._findPrevOrder(isBuy, 12)).to.be.revertedWith(
        '_findPrevOrder not exist'
      )
      await expect(
        pairorderbook
          .connect(owner)
          .updateOrder(
            isBuy,
            index,
            newPrice,
            newAmount,
            prevIndexAdd,
            prevIndexRemove
          )
      ).to.be.revertedWith('index not exist')
    })
    it('Should revert when UpdateOrder and index-preindex are not contiguous', async () => {
      let isBuy = 0
      let newPrice = 300
      let newAmount = 1
      let index = 1 //  orderBUY  100(index1)  99.67(index5)
      let prevIndexAdd: BigNumber
      let prevIndexRemove: BigNumber

      prevIndexAdd = BigNumber.from(5)
      prevIndexRemove = BigNumber.from(1)

      await expect(
        pairorderbook
          .connect(owner)
          .updateOrder(
            isBuy,
            index,
            newPrice,
            newAmount,
            prevIndexAdd,
            prevIndexRemove
          )
      ).to.be.revertedWith('index is not prevIndex')
    })

    it('Should revert when UpdateOrder and not owner  position order', async () => {
      let isBuy = 0
      let newPrice = 300
      let newAmount = 1
      let index = 1 //  orderBUY  100(index1)  99.67(index5)
      let prevIndexAdd: BigNumber
      let prevIndexRemove: BigNumber

      prevIndexAdd = await pairorderbook._findIndex(newPrice, isBuy)
      prevIndexRemove = await pairorderbook._findPrevOrder(isBuy, index)
      await expect(
        pairorderbook
          .connect(addr1)
          .updateOrder(
            isBuy,
            index,
            newPrice,
            newAmount,
            prevIndexAdd,
            prevIndexRemove
          )
      ).to.be.revertedWith('you are not owner of this position order') // cause we createLimitOrder before removeOrder
    })

    it('Should pass when UpdateOrder and index-preindex are contiguous and exist', async () => {
      let prevIndexAdd: BigNumber
      let prevIndexRemove: BigNumber
      let newPrice: BigNumber
      let newAmount: BigNumber
      let balancesSpotToken1: BigNumber
      let balancesTradeToken1: BigNumber
      let balancesSpotToken0: BigNumber
      let balancesTradeToken0: BigNumber

      let index: number
      let isSell = 1 // orderSELL 152.51(index2) 195.23(index1)

      let isBuy = 0 // orderBUY 100(index1)  99.67(index5)

      // update  orderBUY

      balancesSpotToken1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      balancesTradeToken1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )

      balancesSpotToken0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      balancesTradeToken0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )

      index = 5 // index(5) 99.67
      newPrice = toWei(130)
      newAmount = toWei(1)
      prevIndexAdd = await pairorderbook._findIndex(newPrice, isBuy)
      prevIndexRemove = await pairorderbook._findPrevOrder(isBuy, index)
      await pairorderbook
        .connect(owner)
        .updateOrder(
          isBuy,
          index,
          newPrice,
          newAmount,
          prevIndexAdd,
          prevIndexRemove
        )

      // when update  BUY  100  99.67 --update(index5)-->  130  100

      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([toWei(130), toWei(100)])

      //cheack balancesSpot and balancesTrade
      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1.sub(newPrice.sub(toWei(99.67))))
      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1.add(newPrice.sub(toWei(99.67))))

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0)
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0)

      // remove  orderSELL

      balancesSpotToken1 = await pairorderbook.balancesSpot(
        owner.address,
        token1.address
      )
      balancesTradeToken1 = await pairorderbook.balancesTrade(
        owner.address,
        token1.address
      )

      balancesSpotToken0 = await pairorderbook.balancesSpot(
        owner.address,
        token0.address
      )
      balancesTradeToken0 = await pairorderbook.balancesTrade(
        owner.address,
        token0.address
      )

      index = 2 // index(2) 152.51
      newPrice = toWei(333)
      newAmount = toWei(10)
      prevIndexAdd = await pairorderbook._findIndex(newPrice, isSell)
      prevIndexRemove = await pairorderbook._findPrevOrder(isSell, index)
      await pairorderbook
        .connect(owner)
        .updateOrder(
          isSell,
          index,
          newPrice,
          newAmount,
          prevIndexAdd,
          prevIndexRemove
        )
      // when update  SELL    152.51(index2) 195.23(index1)  --update(index2)-->   195.23 333

      expect(
        orderToList(await pairorderbook.getOrderBook(isSell))
      ).to.deep.equal([toWei(195.23),toWei(333)])

      //cheack balancesSpot and balancesTrade
      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1)
      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1)

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0.sub(newAmount.sub(toWei(1))))
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0.add(newAmount.sub(toWei(1))))
    })
  })

  describe('MarketOrder', async () => {
    beforeEach(async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1
      let tokenMint = toWei(1000)

      //mint token to address1
      await token0.connect(owner).mint(addr1.address, tokenMint)
      await token1.connect(owner).mint(addr1.address, tokenMint)

      // approve
      await token0.connect(addr1).approve(pairorderbook.address, tokenMint)
      await token1.connect(addr1).approve(pairorderbook.address, tokenMint)

      // deposit token
      await pairorderbook.connect(addr1).deposit(tokenMint, token0.address)
      await pairorderbook.connect(addr1).deposit(tokenMint, token1.address)

      // buy price 100
      price = 100
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 300
      price = 300
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 52.24
      price = 52.24
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 195.23
      price = 195.23
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 150
      price = 150
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)
      // buy price 101.42
      price = 101.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 152.51
      price = 152.51
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)
      // Sell price 11.42
      price = 11.42
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      // buy price 99.67
      price = 99.67
      prevNodeID = await pairorderbook._findIndex(toWei(price), isBuy)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isBuy, toWei(amount), toWei(price), prevNodeID)

      // Sell price 9.1
      price = 9.1
      prevNodeID = await pairorderbook._findIndex(toWei(price), isSell)
      await pairorderbook
        .connect(addr1)
        .createLimitOrder(isSell, toWei(amount), toWei(price), prevNodeID)

      //BUY 100(index1)  99.67(index5)
      //SELL 152.51(index2) 195.23(index1)
    })

    it('Should revert when MarketOrder Sell and not enough balancesSpot token for sell', async () => {
      let isSell = 1
      await expect(
        pairorderbook.createMarketOrder(isSell, initialSupply.add(toWei(1)),0)
      ).to.be.revertedWith('not enough balance token for MarketOrder')
    })
    it('Should revert when MarketOrder Buy and not enough balancesSpot token for buy', async () => {
      let isBuy = 0
      await expect(
        pairorderbook.createMarketOrder(isBuy, initialSupply.add(toWei(1)), 0)
      ).to.be.revertedWith('not enough balance token for MarketOrder')
    })
    it('Should pass and correct balances when MarketOrder Sell', async () => {
      let isSell = 1
      let isBuy = 0
      let amount = 1
      let cost: BigNumber
      let balancesSpotToken1Owner: BigNumber
      let balancesTradeToken1Owner: BigNumber
      let balancesSpotToken0Owner: BigNumber
      let balancesTradeToken0Owner: BigNumber

      let balancesSpotToken1Addr1: BigNumber
      let balancesTradeToken1Addr1: BigNumber
      let balancesSpotToken0Addr1: BigNumber
      let balancesTradeToken0Addr1: BigNumber

      balancesSpotToken1Owner = (
        await pairorderbook.balancesSpot(owner.address, token1.address)
      )
      balancesTradeToken1Owner = (
        await pairorderbook.balancesTrade(owner.address, token1.address)
      )

      balancesSpotToken0Owner = (
        await pairorderbook.balancesSpot(owner.address, token0.address)
      )
      balancesTradeToken0Owner = (
        await pairorderbook.balancesTrade(owner.address, token0.address)
      )

      balancesSpotToken1Addr1 = (
        await pairorderbook.balancesSpot(addr1.address, token1.address)
      )
      balancesTradeToken1Addr1 = (
        await pairorderbook.balancesTrade(addr1.address, token1.address)
      )

      balancesSpotToken0Addr1 = (
        await pairorderbook.balancesSpot(addr1.address, token0.address)
      )
      balancesTradeToken0Addr1 = (
        await pairorderbook.balancesTrade(addr1.address, token0.address)
      )

      // BUY order -->  100  99.67
      await pairorderbook.connect(owner).createMarketOrder(isSell, toWei(amount),0)

      // when MarketOrderSell    100  99.67  --MarketOrder Sell-->    99.67

      expect(
        orderToList(await pairorderbook.getOrderBook(isBuy))
      ).to.deep.equal([toWei(99.67)])

      cost = toWei(100)

      //cheack balancesSpot and balancesTrade

      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1Owner.add(cost)) 

      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1Owner)

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0Owner.sub(toWei(amount))) //
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0Owner)

      expect(
        await pairorderbook.balancesSpot(addr1.address, token1.address)
      ).to.be.equal(balancesSpotToken1Addr1)
      expect(
        await pairorderbook.balancesTrade(addr1.address, token1.address)
      ).to.be.equal(balancesTradeToken1Addr1.sub(cost)) //

      expect(
        await pairorderbook.balancesSpot(addr1.address, token0.address)
      ).to.be.equal(balancesSpotToken0Addr1.add(toWei(amount))) //
      expect(
        await pairorderbook.balancesTrade(addr1.address, token0.address)
      ).to.be.equal(balancesTradeToken0Addr1)
    })

    it('Should pass and correct balances when MarketOrder Buy', async () => {
      let isSell = 1
      let isBuy = 0
      let amount = 152.51
      let cost: BigNumber
      let balancesSpotToken1Owner: BigNumber
      let balancesTradeToken1Owner: BigNumber
      let balancesSpotToken0Owner: BigNumber
      let balancesTradeToken0Owner: BigNumber

      let balancesSpotToken1Addr1: BigNumber
      let balancesTradeToken1Addr1: BigNumber
      let balancesSpotToken0Addr1: BigNumber
      let balancesTradeToken0Addr1: BigNumber

      balancesSpotToken1Owner = (
        await pairorderbook.balancesSpot(owner.address, token1.address)
      )
      balancesTradeToken1Owner = (
        await pairorderbook.balancesTrade(owner.address, token1.address)
      )

      balancesSpotToken0Owner = (
        await pairorderbook.balancesSpot(owner.address, token0.address)
      )
      balancesTradeToken0Owner = (
        await pairorderbook.balancesTrade(owner.address, token0.address)
      )

      balancesSpotToken1Addr1 = (
        await pairorderbook.balancesSpot(addr1.address, token1.address)
      )
      balancesTradeToken1Addr1 = (
        await pairorderbook.balancesTrade(addr1.address, token1.address)
      )

      balancesSpotToken0Addr1 = (
        await pairorderbook.balancesSpot(addr1.address, token0.address)
      )
      balancesTradeToken0Addr1 = (
        await pairorderbook.balancesTrade(addr1.address, token0.address)
      )

      // SELL order -->  152.51  195.23
      await pairorderbook.connect(owner).createMarketOrder(isBuy,toWei(amount),0)

      // when MarketOrderBuy    152.51  195.23  --MarketOrder Buy-->   195.23

      expect(
        orderToList(await pairorderbook.getOrderBook(isSell))
      ).to.deep.equal([toWei(195.23)])

      cost = toWei(1)

      //cheack balancesSpot and balancesTrade
      expect(
        await pairorderbook.balancesSpot(owner.address, token1.address)
      ).to.be.equal(balancesSpotToken1Owner.sub(toWei(amount))) //
      expect(
        await pairorderbook.balancesTrade(owner.address, token1.address)
      ).to.be.equal(balancesTradeToken1Owner)

      expect(
        await pairorderbook.balancesSpot(owner.address, token0.address)
      ).to.be.equal(balancesSpotToken0Owner.add(cost)) //
      expect(
        await pairorderbook.balancesTrade(owner.address, token0.address)
      ).to.be.equal(balancesTradeToken0Owner)

      expect(
        await pairorderbook.balancesSpot(addr1.address, token1.address)
      ).to.be.equal(balancesSpotToken1Addr1.add(toWei(amount))) //
      expect(
        await pairorderbook.balancesTrade(addr1.address, token1.address)
      ).to.be.equal(balancesTradeToken1Addr1)

      expect(
        await pairorderbook.balancesSpot(addr1.address, token0.address)
      ).to.be.equal(balancesSpotToken0Addr1)
      expect(
        await pairorderbook.balancesTrade(addr1.address, token0.address)
      ).to.be.equal(balancesTradeToken0Addr1.sub(cost)) //
    })
  })
})
