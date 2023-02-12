import React, { useContext, useEffect, useState, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ContractContext } from '../context/ContratContext'
import { ConvertDateTime } from '../utils/DateTime'
import { createChart, ColorType } from 'lightweight-charts'
import { ethers } from 'ethers'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// export const options = {
//   responsive: true,
//   plugins: {
//     // legend: {
//     //   position: 'top' as const,
//     // },
//     // title: {
//     //   display: true,
//     //   text: 'Chart.js Line Chart',
//     // },
//   },
// }

// const labels = [22, 23, 1, 3, 5, 6,7,8,9,19,12,4,1,45,6,4]

// export const data = {
//   labels,
//   datasets: [
//     {
//       label: 'Price BTC/USDT',
//       data: [1, 2, 3, 4, 5, 1, 5, 1, 90, 7, 2, 5, 8, 3, 1, 6],
//       borderColor: 'rgb(255, 99, 132)',
//       backgroundColor: 'rgba(255, 99, 132, 0.5)',
//       // pointHoverRadius: 5,
//     },
//   ],
// }



interface Props  {
  data : TypeTradingView[]
}
export const ChartComponent = ({ data }: Props) => {
  const { tradingViewList } = useContext(ContractContext)

  const backgroundColor = 'black'
  const lineColor = '#2962FF'
  const textColor = 'black'
  const areaTopColor = '#2962FF'
  const areaBottomColor = 'rgba(41, 98, 255, 0.28)'

  const chartContainerRef = useRef()

  useEffect(() => {
    console.log('tradingViewList', tradingViewList)

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    })
    chart.timeScale().fitContent()

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderDownColor: '#ff4976',
      borderUpColor: '#4bffb5',
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
    })
    candleSeries.setData(tradingViewList)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [
    tradingViewList,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ])

  return <div ref={chartContainerRef} />
}

const initialData = [
  { time: '2018-12-22', value: 32.51 },
  { time: '2018-12-23', value: 31.11 },
  { time: '2018-12-24', value: 27.02 },
  { time: '2018-12-25', value: 27.32 },
  { time: '2018-12-26', value: 25.17 },
  { time: '2018-12-27', value: 28.89 },
  { time: '2018-12-28', value: 25.46 },
  { time: '2018-12-29', value: 23.92 },
  { time: '2018-12-30', value: 22.68 },
  { time: '2018-12-31', value: 22.67 },
]


const TradingviewGraph = () => {


  // const { marketEvent, sumMarketEvent } = useContext(ContractContext)
  // const [priceaction, setPrice] = useState<number []>([])
  // const [timeaction, setTime] = useState<string[]>([])
  
  // const sorting = () => {
  //   sumMarketEvent.sort(function (a, b) {
  //     return b.Date - a.Date
  //   })
  // }
  // const getPriceAndTime = () => {
  //   sorting()
  //   let chartprice:number[] = []
  //   let charttime:string[] = []
  //   sumMarketEvent.forEach((value) => {
  //     chartprice.push(Number(value.price))
  //     charttime.push(ConvertDateTime(value.Date))
  //   })
  //   chartprice.reverse()
  //   charttime.reverse()
    
  //   setPrice(chartprice)
  //   setTime(charttime)
  //   sorting()
  // }

  // useEffect(() => {
  //   getPriceAndTime()
  // }, [sumMarketEvent])
  

  // const data = {
  //   labels: timeaction,
  //   datasets: [
  //     {
  //       label: 'Price BTC/USDT',
  //       fill: false,
  //       lineTension: 0.1,
  //       backgroundColor: 'rgba(255, 99, 132, 0.5)',
  //       borderColor: 'rgb(255, 99, 132)',
  //       borderDash: [],
  //       borderDashOffset: 0.1,
  //       borderJoinStyle: 'miter',
  //       pointBorderColor: 'rgba(75,192,192,1)',
  //       pointBackgroundColor: '#fff',
  //       pointBorderWidth: 1,
  //       pointHoverRadius: 5,
  //       pointHoverBackgroundColor: 'rgba(75,192,192,1)',
  //       pointHoverBorderColor: 'rgba(220,220,220,1)',
  //       pointHoverBorderWidth: 2,
  //       pointRadius: 2,
  //       pointHitRadius: 10,
  //       data: priceaction,
  //     },
  //   ],
  // }

  return (
    <div className="h-full py-12">
      {/* <Line data={data as any} /> */}
      {/* <Line  data={data as any} /> */}
      <ChartComponent  data={initialData}></ChartComponent>
    </div>
  )
}

export default TradingviewGraph