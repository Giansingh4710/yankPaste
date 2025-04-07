import { Button } from 'flowbite-react'

export function ButtonLabel({ text, Icon, action }) {
  return (
    <div className='flex flex-col items-center'>
      <Button className='flex-1 w-height' onClick={action}>
        <Icon className='h-full w-8' />
      </Button>
      <span className='flex-1 ml-2'>{text}</span>
    </div>
  )
}
