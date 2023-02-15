import {PairNewOrder} from '../../typechain-types'
export function orderToList(listOrder: PairNewOrder.OrderStructOutput[])  {
  
  let resultPrice = []
  listOrder.map((item) => {
    resultPrice.push(item.price)
  }) 
  return resultPrice  
}


