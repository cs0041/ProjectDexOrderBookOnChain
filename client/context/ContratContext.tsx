import React, {createContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import artifactPairNewOrder from '../../artifacts/contracts/PairOrder.sol/PairNewOrder.json'
import artifactToken from '../../artifacts/contracts/Token0.sol/Token0.json'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../../typechain-types'
// const ContractPairOrderAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
// const ContractToken0Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
// const ContractToken1Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const initBlockTime = 31949670

import { ContractPairOrderAddress,ContractToken0Address,ContractToken1Address } from '../utils/Address'
import { convertToOHLC } from '../utils/CovertCandle'
interface IContract {
  loadingOrderSell: boolean
  loadingOrderBuy: boolean
  loadOrderBook: () => Promise<void>
  orderBookSell: Order[]
  orderBookBuy: Order[]
  priceToken: string
  sendTxMarketOrder: (side: number, amount: number | string) => Promise<void>
  balancesSpotToken0: string
  balancesTradeToken0: string
  balancesSpotToken1: string
  balancesTradeToken1: string
  sendTxLimitOrder : (side: number, amount: number | string, price: number | string) => Promise<void>
  isLoadingOrderBookByAddress:boolean
  orderBookByAddress:Order[]
  loadOrderBookByAddress: (address: string) => Promise<void>
  sendTxCancelOrder: (side: number, id: number | string) => Promise<void>
  sendTxUpdateOrder: (side: number, id: number, newAmount: number | string, newPriceOrder: number | string) => Promise<void>
  marketEvent: PairNewOrder.OrderMarketStructOutput[]
  historyOrderEvent:PairNewOrder.OrderHistoryStructOutput[]
  // sumMarketEvent:EventMarketOrder[]
  sendTxDeposit: (amount: number | string, addressToken: string) => Promise<void>
  sendTxWithdraw: (amount: number | string, addressToken: string) => Promise<void>
  tradingViewList: TypeTradingView[]
  loadHistoryByAddress: () => Promise<void>
}

export const ContractContext = createContext<IContract>({
  loadingOrderSell: false,
  loadingOrderBuy: false,
  loadOrderBook: async () => {},
  orderBookSell: [],
  orderBookBuy: [],
  priceToken: '',
  sendTxMarketOrder: async () => {},
  balancesSpotToken0: '',
  balancesTradeToken0: '',
  balancesSpotToken1: '',
  balancesTradeToken1: '',
  sendTxLimitOrder: async () => {},
  isLoadingOrderBookByAddress: false,
  orderBookByAddress: [],
  loadOrderBookByAddress: async () => {},
  sendTxCancelOrder: async () => {},
  sendTxUpdateOrder: async () => {},
  marketEvent: [],
  historyOrderEvent: [],
  // sumMarketEvent: [],
  sendTxDeposit: async () => {},
  sendTxWithdraw: async () => {},
  tradingViewList: [],
  loadHistoryByAddress: async () => {},
})








const getPairOrderContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any )
  const signer = provider.getSigner()
  const pairordercontract = new ethers.Contract(
    ContractPairOrderAddress,
    artifactPairNewOrder.abi,
    signer
  ) as PairNewOrder

  return pairordercontract
}
const getTokenContract = (tokenAddress : string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any)
  const signer = provider.getSigner()
  const tokenContract = new ethers.Contract(tokenAddress, artifactToken.abi, signer) as Token0

  return tokenContract
}

interface ChildrenProps {
  children: React.ReactNode
}


export const ContractProvider = ({ children }: ChildrenProps) => {
  const [initialLoading, setInitialLoading] = useState(true)

  // order sell
  const [orderBookSell, setOrderBookSell] = useState<Order[]>([])
  const [loadingOrderSell, setLoadingOrderSell] = useState(false)

  // order buy
  const [orderBookBuy, setOrderBookBuy] = useState<Order[]>([])
  const [loadingOrderBuy, setLoadingOrderBuy] = useState(false)

  // price
  const [priceToken, setPriceToken] = useState<string>('')

  // balances
  const [balancesSpotToken0, setBalancesSpotToken0] = useState<string>('')
  const [balancesTradeToken0, setBalancesTradeToken0] = useState<string>('')
  const [balancesSpotToken1, setBalancesSpotToken1] = useState<string>('')
  const [balancesTradeToken1, setBalancesTradeToken1] = useState<string>('')

  // order by address
  const [orderBookByAddress, setOrderBookByAddress] = useState<Order[]>([])
  const [isLoadingOrderBookByAddress, setIsLoadingOrderBookByAddress] =
    useState(true)

  // Market order
  const [marketEvent, setMarketEvent] = useState< PairNewOrder.OrderMarketStructOutput[]>([])

  // Sum Market order
  const [sumMarketEvent, setSumMarketEvent] = useState<EventMarketOrder[]>([])

  // History order
  const [historyOrderEvent, setHistoryOrderEvent] = useState<PairNewOrder.OrderHistoryStructOutput[]>([])

  // tradingView
  const [tradingViewList, setTradingViewList] = useState<TypeTradingView[]>([])

  // helper
  // const toString = (bytes32) => ethers.utils.parseBytes32String(bytes32)
  const toWei = (ether: string | number) =>
    ethers.utils.parseEther(String(ether))
  const toEther = (wei: string | number | ethers.BigNumber) =>
    ethers.utils.formatEther(wei)
  const toFixUnits = (amount: number, decimal: string) =>
    ethers.utils.formatUnits(amount, decimal)
  const toEtherandFixFloatingPoint = (amount: ethers.BigNumber) =>
    Number(ethers.utils.formatEther(amount)).toFixed(6)

  useEffect(() => {
    if (!window.ethereum) return console.log('Please install metamask')
    loadOrderBook()
    loadPriceToken()
    loadBalances()
    loadOrderBookByAddress()

    loadHistoryByAddress()
    loadHistoryMarketOrder()

    addlistenerMarketEvents()
    // MarketQueryEvents()
    // QueryHisoryEvents()

    setInitialLoading(false)
  }, [])

  const sendTxDeposit = async (
    _amount: number | string,
    addressToken: string
  ) => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const amount = toWei(_amount)
      const contract = getPairOrderContract()
      const token = getTokenContract(addressToken)
      const address = (
        await window.ethereum.request({ method: 'eth_accounts' })
      )[0]
      // const amountApprove = (await token.allowance(address,ContractPairOrderAddress)).toNumber()
      const transactionHashApprove = await token.approve(
        ContractPairOrderAddress,
        amount
      )
      await transactionHashApprove.wait()
      // if (amountApprove< amount.to){
      //     const transactionHashApprove = await token.approve(ContractPairOrderAddress,amount)
      // }
      const transactionHash = await contract.deposit(amount, addressToken)
      console.log(transactionHash.hash)
      await transactionHash.wait()
    } catch (error) {
      console.log(error)
    }
    loadBalances()
  }
  const sendTxWithdraw = async (
    _amount: number | string,
    addressToken: string
  ) => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const amount = toWei(_amount)
      const contract = getPairOrderContract()
      const transactionHash = await contract.withdraw(amount, addressToken)
      console.log(transactionHash.hash)
      await transactionHash.wait()
    } catch (error) {
      console.log(error)
    }
    loadBalances()
  }
  const sendTxMarketOrder = async (side: number, _amount: number | string) => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()
      const amount = toWei(_amount)
      const transactionHash = await contract.createMarketOrder(side, amount,0)
      console.log(transactionHash.hash)
      await transactionHash.wait()
      loadOrderBook()
      loadPriceToken()
      loadBalances()
      loadHistoryByAddress()
      loadHistoryMarketOrder()
    } catch (error) {
      console.log(error)
    }

  }

  const sendTxLimitOrder = async (
    side: number,
    _amount: number | string,
    _price: number | string
  ) => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const amount = toWei(_amount)
      const price = toWei(_price)
      const contract = getPairOrderContract()
      const prevNodeID = await contract._findIndex(price, side)
      const transactionHash = await contract.createLimitOrder(
        side,
        amount,
        price,
        prevNodeID
      )
      console.log(transactionHash.hash)
      await transactionHash.wait()
      loadOrderBook()
      loadBalances()
      loadOrderBookByAddress()
      loadHistoryByAddress()
    } catch (error) {
      console.log(error)
    }

  }

  const sendTxUpdateOrder = async (
    side: number,
    id: number,
    _newAmount: number | string,
    _newPriceOrder: number | string
  ) => {
    // updateOrder(Side _side,uint256 index, uint256 newPriceOrder, uint256 newAmount,uint256 prevIndexAdd,uint256 prevIndexRemove)

    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const newAmount = toWei(_newAmount)
      const newPriceOrder = toWei(_newPriceOrder)
      console.log('side', side)
      console.log('newAmount', newAmount)
      console.log('newPriceOrder', newPriceOrder)
      console.log('id', id)
      const contract = getPairOrderContract()
      const prevIndexAdd = await contract._findIndex(newPriceOrder, side)
      const prevIndexRemove = await contract._findPrevOrder(side, id)
      console.log('prevIndexAdd', prevIndexAdd.toNumber())
      console.log('prevIndexRemove', prevIndexRemove.toNumber())
      const transactionHash = await contract.updateOrder(
        side,
        id,
        newPriceOrder,
        newAmount,
        prevIndexAdd,
        prevIndexRemove
      )

      //       prevIndexAdd = await pairorderbook._findIndex(newPrice, isBuy)
      // prevIndexRemove = await pairorderbook._findPrevOrder(isBuy, index)
      // await pairorderbook.connect(owner).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)

      console.log(transactionHash.hash)
      await transactionHash.wait()
      loadOrderBook()
      loadBalances()
      loadOrderBookByAddress()
      loadHistoryByAddress()
    } catch (error) {
      console.log(error)
    }

  }

  const sendTxCancelOrder = async (side: number, id: number | string) => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()
      const prevNodeID = await contract._findPrevOrder(side, id)
      const transactionHash = await contract.removeOrder(side, id, prevNodeID)
      console.log(transactionHash.hash)
      await transactionHash.wait()
      loadOrderBook()
      loadOrderBookByAddress()
      loadBalances()
      loadHistoryByAddress()
    } catch (error) {
      console.log(error)
    }

  }

  const loadPriceToken = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()

      const dataPriceToken = await contract.price()

      setPriceToken(toEtherandFixFloatingPoint(dataPriceToken))
    } catch (error) {
      console.log(error)
    }
  }

  const loadBalances = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })

      const [dataBalancesSpotToken0, dataBalancesTradeToken0] =
        await Promise.all([
          await contract.balancesSpot(accounts[0], ContractToken0Address),
          await contract.balancesTrade(accounts[0], ContractToken0Address),
        ])
      setBalancesSpotToken0(toEtherandFixFloatingPoint(dataBalancesSpotToken0))
      setBalancesTradeToken0(
        toEtherandFixFloatingPoint(dataBalancesTradeToken0)
      )

      const [dataBalancesSpotToken1, dataBalancesTradeToken1] =
        await Promise.all([
          await contract.balancesSpot(accounts[0], ContractToken1Address),
          await contract.balancesTrade(accounts[0], ContractToken1Address),
        ])

      setBalancesSpotToken1(toEtherandFixFloatingPoint(dataBalancesSpotToken1))
      setBalancesTradeToken1(
        toEtherandFixFloatingPoint(dataBalancesTradeToken1)
      )
    } catch (error) {
      console.log(error)
    }
  }

  const loadOrderBook = async () => {
    if (!window.ethereum) return console.log('Please install metamask')

    setLoadingOrderBuy(true)
    setLoadingOrderSell(true)
    try {
      setOrderBookBuy([])
      setOrderBookSell([])

      const contract = getPairOrderContract()

      const [dataOrderSell, dataOrderBuy] = await Promise.all([
        await contract.getOrderBook(1),
        await contract.getOrderBook(0),
      ])

      dataOrderBuy.map((order) => {
        const structOrder: Order = {
          id: order.id.toNumber(),
          addressTrader: order.trader,
          BuyOrSell: order.isBuy,
          createdDate: order.createdDate.toString(),
          addressToken: order.token.toString(),
          amount: toEtherandFixFloatingPoint(order.amount),
          price: toEtherandFixFloatingPoint(order.price),
          filled: toEtherandFixFloatingPoint(order.filled),
        }
        setOrderBookBuy((prev) => [...prev, structOrder])
      })

      dataOrderSell.map((order) => {
        const structOrder: Order = {
          id: order.id.toNumber(),
          addressTrader: order.trader.toString(),
          BuyOrSell: order.isBuy,
          createdDate: order.createdDate.toString(),
          addressToken: order.token.toString(),
          amount: toEtherandFixFloatingPoint(order.amount),
          price: toEtherandFixFloatingPoint(order.price),
          filled: toEtherandFixFloatingPoint(order.filled),
        }
        setOrderBookSell((prev) => [structOrder, ...prev])
      })

      setLoadingOrderBuy(false)
      setLoadingOrderSell(false)
    } catch (error) {
      setLoadingOrderBuy(false)
      setLoadingOrderSell(false)
      setOrderBookBuy([])
      setOrderBookSell([])
      console.log(error)
    }
  }

  const loadOrderBookByAddress = async (address?: string) => {
    if (!window.ethereum) return console.log('Please install metamask')

    setIsLoadingOrderBookByAddress(true)
    try {
      setOrderBookByAddress([])

      const contract = getPairOrderContract()

      if (address == undefined) {
        address = (await window.ethereum.request({ method: 'eth_accounts' }))[0]
      }
      const [dataOrderSell, dataOrderBuy] = await Promise.all([
        await contract.getOrderBook(1),
        await contract.getOrderBook(0),
      ])

      dataOrderBuy.map((order) => {
        if(order.trader == address){
          const structOrder: Order = {
            id: order.id.toNumber(),
            addressTrader: order.trader,
            BuyOrSell: order.isBuy,
            createdDate: order.createdDate.toString(),
            addressToken: order.token.toString(),
            amount: toEtherandFixFloatingPoint(order.amount),
            price: toEtherandFixFloatingPoint(order.price),
            filled: toEtherandFixFloatingPoint(order.filled),
          }
            setOrderBookByAddress((prev) => [...prev, structOrder])
        }
      })

      dataOrderSell.map((order) => {
       if(order.trader == address){
          const structOrder: Order = {
            id: order.id.toNumber(),
            addressTrader: order.trader,
            BuyOrSell: order.isBuy,
            createdDate: order.createdDate.toString(),
            addressToken: order.token.toString(),
            amount: toEtherandFixFloatingPoint(order.amount),
            price: toEtherandFixFloatingPoint(order.price),
            filled: toEtherandFixFloatingPoint(order.filled),
          }
            setOrderBookByAddress((prev) => [...prev, structOrder])
        }
      })



      setIsLoadingOrderBookByAddress(false)
    } catch (error) {
      setIsLoadingOrderBookByAddress(false)
      setOrderBookByAddress([])
      console.log(error)
    }
  }

  const loadHistoryByAddress = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })

      const data = await contract.getOrderHisotyByAddress(accounts[0])
      const covertData = Object.keys(data).map((key) => data[key as any])

      setHistoryOrderEvent(covertData.reverse())
    } catch (error) {
      console.log(error)
    }
  }
  const loadHistoryMarketOrder = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()

      const data = await contract.getMarketOrder()
      const covertData = Object.keys(data).map((key) => data[key as any])
      setMarketEvent(covertData.reverse())

      let temp: TypesTradingViewOriginal[] = []
      data.map((item)=>{
         const data: TypesTradingViewOriginal = {
           price: Number(ethers.utils.formatEther(item.price)),
           time: item.date.toNumber(),
           //  close: Number(ethers.utils.formatEther(item.price)),
           //  high: Number(ethers.utils.formatEther(item.price)),
           //  low: Number(ethers.utils.formatEther(item.price)),
           //  open: 50,
           //  time: item.date.toNumber(),
         }
         temp.push(data)
        // setTradingViewList((prev) => [...prev,data])
      })
      setTradingViewList(convertToOHLC(temp))
      // console.log("temp",temp)
      // convertToOHLC(tradingViewList)
    } catch (error) {
      console.log(error)
    }
  }

  const addlistenerMarketEvents = async() => {
    if (!window.ethereum) return console.log('Please install metamask')
     try {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any )
        const contract = new ethers.Contract(ContractPairOrderAddress, artifactPairNewOrder.abi, provider) as PairNewOrder
        
        contract.on('MarketOrder', async () => {
          loadHistoryMarketOrder()
          loadOrderBook() 
        })
        contract.on('CreateLimitOrder', async () => {
             loadOrderBook()
        })
        contract.on('UpdateOrder', async () => {
             loadOrderBook()
        })
        contract.on('RemoveOrder', async () => {
             loadOrderBook()
        })

      } catch (error) {

      }
  }

  /////////////////////////////////////////////////////////////////////
  // QueryEvents for the backend But now use another method instead  //
  /////////////////////////////////////////////////////////////////////
  // const MarketQueryEvents = async() => {
  //   if (!window.ethereum) return console.log('Please install metamask')
  //    try {
  //       const provider = new ethers.providers.Web3Provider(window.ethereum as any )
  //       const blockNumber = await provider.getBlockNumber()
  //       const contract = new ethers.Contract(ContractPairOrderAddress, artifactPairNewOrder.abi, provider) as PairNewOrder
  //       //const filter = contract.filters.CreateLimitOrder()
  //       const filterMarketOrder = contract.filters.MarketOrder()
  //       const filterSumMarketOrder = contract.filters.SumMarketOrder()

  //         const [
  //           dataMarketOrder,
  //           dataSumMarketOrder,
  //         ] = await Promise.all([
  //           await contract.queryFilter(filterMarketOrder, initBlockTime, blockNumber),
  //           await contract.queryFilter(filterSumMarketOrder, initBlockTime, blockNumber)
  //         ])

  //       dataMarketOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventMarketOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args._amount),
  //           price: toEtherandFixFloatingPoint(item.args._price),
  //         }
  //         // console.log(structEvent)
  //         setMarketEvent((prev) => [structEvent, ...prev])
  //       })

  //       dataSumMarketOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventMarketOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args._amount),
  //           price: toEtherandFixFloatingPoint(item.args._lastPrice),
  //         }
  //         // console.log(structEvent)
  //         setSumMarketEvent((prev) => [structEvent, ...prev])
  //       })

  //       contract.on('MarketOrder', async (_isBuy,_amount,_price,event) => {
  //          const timeDate = (await provider.getBlock(event.blockNumber)).timestamp
  //          const structEvent: EventMarketOrder = {
  //            Date: timeDate,
  //            Side: _isBuy,
  //            amount: toEtherandFixFloatingPoint(_amount),
  //            price: toEtherandFixFloatingPoint(_price),
  //          }
  //          console.log("MarketOrder tigger",structEvent)
  //         setMarketEvent((prev) => [structEvent,...prev])
  //         // loadOrderBook()
  //       })

  //       contract.on('SumMarketOrder', async (_isBuy,_amount,_price,event) => {
  //          const timeDate = (await provider.getBlock(event.blockNumber)).timestamp
  //          const structEvent: EventMarketOrder = {
  //            Date: timeDate,
  //            Side: _isBuy,
  //            amount: toEtherandFixFloatingPoint(_amount),
  //            price: toEtherandFixFloatingPoint(_price),
  //          }
  //            console.log('SumMarketOrder tigger', structEvent)
  //         setSumMarketEvent((prev) => [structEvent, ...prev])
  //         // loadOrderBook()
  //       })
  //     } catch (error) {

  //     }
  // }

  /////////////////////////////////////////////////////////////////////
  // QueryEvents for the backend But now use another method instead  //
  /////////////////////////////////////////////////////////////////////
  // const QueryHisoryEvents = async() => {
  //   if (!window.ethereum) return console.log('Please install metamask')
  //    try {
  //       setHistoryOrderEvent([])
  //       const provider = new ethers.providers.Web3Provider(window.ethereum as any )
  //       const blockNumber = await provider.getBlockNumber()
  //       const contract = new ethers.Contract(ContractPairOrderAddress, artifactPairNewOrder.abi, provider) as PairNewOrder
  //       const address = ( await window.ethereum.request({ method: 'eth_accounts' }))[0]
  //       const filterLimitOrder = contract.filters.CreateLimitOrder(null,null,null,address)
  //       const filterUpdateOrder = contract.filters.UpdateOrder(null,null,null,address)
  //       const filterRemoveOrder = contract.filters.RemoveOrder(null, null,null,address)
  //       const filterMarketOrder = contract.filters.SumMarketOrder(null,null,null,address)
  //       const [
  //         dataLimitOrder,
  //         dataUpdateOrder,
  //         dataRemoveOrder,
  //         dataMarketOrder,
  //       ] = await Promise.all([
  //         await contract.queryFilter(filterLimitOrder, initBlockTime, blockNumber),
  //         await contract.queryFilter(filterUpdateOrder, initBlockTime, blockNumber),
  //         await contract.queryFilter(filterRemoveOrder, initBlockTime, blockNumber),
  //         await contract.queryFilter(filterMarketOrder, initBlockTime, blockNumber),
  //       ])

  //       dataLimitOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventAllOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args._amount),
  //           price: toEtherandFixFloatingPoint(item.args._price),
  //           Type: 'Limit',
  //         }
  //         console.log('dataLimitOrder',structEvent)
  //         setHistoryOrderEvent((prev) => [...prev, structEvent])
  //       })
  //       dataUpdateOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventAllOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args.newAmount),
  //           price: toEtherandFixFloatingPoint(item.args.newPriceOrder),
  //           Type: 'Update',
  //         }
  //          console.log('dataUpdateOrder', structEvent)
  //         setHistoryOrderEvent((prev) => [...prev, structEvent])
  //       })
  //       dataRemoveOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventAllOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args._amount),
  //           price: toEtherandFixFloatingPoint(item.args._price),
  //           Type: 'Remove',
  //         }
  //            console.log('dataRemoveOrder', structEvent)
  //         setHistoryOrderEvent((prev) => [...prev, structEvent])
  //       })
  //       dataMarketOrder.map(async (item) => {
  //         const timeDate = (await provider.getBlock(item.blockNumber)).timestamp
  //         const structEvent: EventAllOrder = {
  //           Date: timeDate,
  //           Side: item.args._isBuy,
  //           amount: toEtherandFixFloatingPoint(item.args._amount),
  //           price: '0',
  //           Type: 'Market',
  //         }
  //            console.log('dataMarketOrder', structEvent)
  //         setHistoryOrderEvent((prev) => [...prev, structEvent])
  //       })

  //         contract.on('CreateLimitOrder', async () => {
  //            loadOrderBook()
  //         })
  //         contract.on('UpdateOrder', async () => {
  //            loadOrderBook()
  //         })
  //         contract.on('RemoveOrder', async () => {
  //            loadOrderBook()
  //         })

  //     } catch (error) {

  //     }
  // }

  return (
    <ContractContext.Provider
      value={{
        loadingOrderSell,
        loadingOrderBuy,
        loadOrderBook,
        orderBookSell,
        orderBookBuy,
        priceToken,
        sendTxMarketOrder,
        balancesSpotToken0,
        balancesTradeToken0,
        balancesSpotToken1,
        balancesTradeToken1,
        sendTxLimitOrder,
        isLoadingOrderBookByAddress,
        orderBookByAddress,
        loadOrderBookByAddress,
        sendTxCancelOrder,
        sendTxUpdateOrder,
        marketEvent,
        historyOrderEvent,
        // sumMarketEvent,
        sendTxDeposit,
        sendTxWithdraw,
        tradingViewList,
        loadHistoryByAddress,
      }}
    >
      {!initialLoading && children}
    </ContractContext.Provider>
  )
}
