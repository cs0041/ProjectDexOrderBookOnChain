import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useAccount, useSigner } from 'wagmi'
import useIsMounted from '../hooks/useIsMounted'
import { polygonMumbai } from 'wagmi/chains'
import { ethers } from 'ethers'
// import { contractFaucetABI, contractFaucetAddress } from '../utils/FaucetABI'

import { useContractRead } from 'wagmi'
import { useContext, useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import artifact from '../../artifacts/contracts/PairOrder.sol/PairNewOrder.json'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../../typechain-types'
import {ContractContext} from '../context/ContratContext'
const ContractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

  
    
interface Inputs {
  data: number
}
// const wagmigotchiContract = {
//   address: contractFaucetAddress,
//   abi: contractFaucetABI,
// }

const Home = () => {
  const {loadOrderBook,loadingOrderBuy,loadingOrderSell,orderBookBuy,orderBookSell} = useContext(ContractContext)
  const [contract, setContract] = useState<PairNewOrder | null>(null)
  useEffect(() => {
    const onLoad = async () =>{
      const contract = await new ethers.Contract(
        ContractAddress,
        artifact.abi 
      ) as PairNewOrder
      setContract(contract)
      
    }
  onLoad()

   
  }, [])


  
  const [dataNumber, setDataNumber] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingTx, setLoadingTx] = useState(false)

  const mounted = useIsMounted()

  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner({
    chainId: polygonMumbai.id,
  })

  const sendTxTest = async (data: number) => {
    try {
      setLoadingTx(true)
      // const FaucetContract = new ethers.Contract(
      //   contractFaucetAddress,
      //   contractFaucetABI,
      //   signer as any
      // )
      // const dataFindindex = await FaucetContract._findIndex(data)
      // const addNumber = await FaucetContract.addStudent(data, dataFindindex)
      // const cheackstatus = await addNumber.wait()
    } catch (error) {
      console.log(error)
    } finally {
      readData()
      console.log('asdasd')
      setLoadingTx(false)
    }
    // const provider =  new ethers.providers.Web3Provider(window.ethereum as any)
    // const signer = provider.getSigner()
  }

  const readData = async () => {
    try {
      setLoading(true)
      // const FaucetContract = new ethers.Contract(
      //   contractFaucetAddress,
      //   contractFaucetABI,
      //   signer as any
      // )
      // const data = await FaucetContract.getData()
      // setDataNumber(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
    // const provider =  new ethers.providers.Web3Provider(window.ethereum as any)
    // const signer = provider.getSigner()
  }

  const [dataOrderBuy,setDataOrderBuy] = useState<PairNewOrder.OrderStructOutput[] >()
  const [dataOrderSell,setDataOrderSell] = useState<PairNewOrder.OrderStructOutput[] >()
  const readDataOrderBook = async (side:number) => {
    try {
  
     //setDataOrder(data!)
     const PairtContract = new ethers.Contract(
        ContractAddress,
        artifact.abi,
       signer as any
       )  as PairNewOrder
       const data = await PairtContract.getOrderBook(side)
       console.log(data)
       if(side == 0){

         setDataOrderBuy(data)
       }else if(side==1) {
        setDataOrderSell(data)
       }

    } catch (error) {
      // console.log(error)
      // alert(error)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async ({ data }) => {
    await sendTxTest(data)
  }

  return (
    mounted && (
      <div>
        <ConnectButton
          label="connect web3"
          accountStatus={'full'}
          chainStatus={'full'}
        />

        {address && <p>My address is {address}</p>}

        <div className='text-red-500 text-3xl'>
          <p >Sell</p>
          <p >
            {loading ? 'Load...' : dataOrderSell?.map((item)=>(
              <p>{` ${item.price.toString()} - ${item.amount.toString()}` }</p>
            ))}
          </p>
          <button
            className="text-black rounded-lg bg-red-500 p-2 px-8"
            onClick={()=>  readDataOrderBook(1)}
          >
            GetOrderSell
          </button>
        </div>

        <div className="text-green-500 text-3xl">
          <p >Buy</p>
          <p >
            {loading ? 'Load...' : dataOrderBuy?.map((item)=>(
              <p>{` ${item.price.toString()} - ${item.amount.toString()}` }</p>
            ))}
          </p>
          <button
            className="text-black rounded-lg bg-red-500 p-2 px-8"
            onClick={()=>  readDataOrderBook(0)}
          >
            GetOrderBuy
          </button>
        </div>

        <div>
          <p className="text-black text-3xl">Sendata</p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0
       md:max-w-md md:px-14"
          >
            <h1 className="text-4xl font-semibold">Sign In</h1>
            <div className="space-y-4">
              <label className="inline-block w-full">
                <input
                  type="number"
                  placeholder="data number"
                  className="input"
                  {...register('data', { required: true })}
                />
                {errors.data && (
                  <p className="p-1 text-[13px] font-light  text-orange-500">
                    Please enter a valid email.
                  </p>
                )}
              </label>
            </div>

            <button className="w-full rounded bg-[#e50914] py-3 font-semibold">
              Sendata
            </button>
          </form>

          {loadingTx ? 'LoadTX...' : `nice`}
        </div>

        <div>data</div>
        <br />
        <br />
        <br />

        <div>dataOrderSell</div>
         {loadingOrderSell ? 'LoadOrderSell...' : orderBookSell?.map((item)=>(
              <p>{` ${item.price} - ${item.amount}` }</p>
            ))}
         

          <br />
          <p>--------------------------------------</p>
          <br />
        <div>dataOrderBuy</div>
         {loadingOrderBuy ? 'LoadOrderBuy...' : orderBookBuy?.map((item)=>(
              <p>{` ${item.price} - ${item.amount}` }</p>
            ))}

          

          <br />
          <p>--------------------------------------</p>
          <br />
        <button
            className="text-black rounded-lg bg-red-500 p-2 px-8"
            onClick={()=> loadOrderBook()}
                >
            GetOrderBuy
          </button>

                

      </div>

    )
  )
}

export default Home
