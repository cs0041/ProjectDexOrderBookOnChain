import toast from 'react-hot-toast'


export function simpleNotificationToast(text: string) {
  toast.success(text, {
    style: {
      backgroundColor: '#1c1c28',
      color: 'white',
      borderWidth: '1px',
      borderColor: 'gray',
      overflow: 'auto',
      fontSize: 16,
      maxWidth: '1200px',
      // minWidth: '500px',
    },
  })
}


export function notificationToast(myFunction: any) {

  toast.promise(
    myFunction,
    {
      loading: 'Loading',
      success: (data) =>
        `Successfully Transaction Hash : https://mumbai.polygonscan.com/tx/${data}`,
      error: (error) => `${error}`,
    },
    {
      style: {
        backgroundColor: '#1c1c28',
        color: 'white',
        borderWidth: '1px',
        borderColor: 'gray',
        overflow: 'auto',
        fontSize: 16,
        maxWidth: '1200px',
        // minWidth: '500px',
      },
      success: {
        duration: 5000,
      },
    }
  )
}
