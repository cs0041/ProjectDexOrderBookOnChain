import { timeStamp } from "console"

export function ConvertDateTime(timestamp : number):string {
    const date = new Date(timestamp * 1000)
    const hours = date.getHours()
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes()
    // Seconds part from the timestamp
    const seconds = '0' + date.getSeconds()

    // Will display time in 10:30:23 format
    const formattedTime =  hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
    return formattedTime
}
