import React, { useContext, useEffect, useState } from 'react'
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



type Props = {}

const TradingviewGraph = (props: Props) => {
  const { marketEvent, sumMarketEvent } = useContext(ContractContext)
  const [priceaction, setPrice] = useState<number []>([])
  const [timeaction, setTime] = useState<string[]>([])
  
  const sorting = () => {
    sumMarketEvent.sort(function (a, b) {
      return b.Date - a.Date
    })
  }
  const getPriceAndTime = () => {
    sorting()
    let chartprice:number[] = []
    let charttime:string[] = []
    sumMarketEvent.forEach((value) => {
      chartprice.push(Number(value.price))
      charttime.push(ConvertDateTime(value.Date))
    })
    chartprice.reverse()
    charttime.reverse()
    
    setPrice(chartprice)
    setTime(charttime)
    sorting()
  }

  useEffect(() => {
    getPriceAndTime()
  }, [sumMarketEvent])
  

  const data = {
    labels: timeaction,
    datasets: [
      {
        label: 'Price BTC/USDT',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [],
        borderDashOffset: 0.1,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 2,
        pointHitRadius: 10,
        data: priceaction,
      },
    ],
  }

  return (
    <div className='h-full py-12'>
      {/* <Line data={data as any} /> */}
      <Line  data={data as any} />
    </div>
  )
}

export default TradingviewGraph