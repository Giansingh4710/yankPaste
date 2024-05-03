import { Button } from 'flowbite-react'
import { Label, Textarea } from 'flowbite-react'
import { useRef, useState } from 'react'
import axios from 'axios'

function App() {
  const [text, setText] = useState('')
  const lastPostedItem = useRef()
  const [disabled, setDisabled] = useState(false)
  useState(() => {
    axios({
      url: '/getLastText',
      method: 'GET',
    })
      .then((res) => {
        setText(res.data.item.text.S)
        lastPostedItem.current = res.data.item
      })
      .catch((err) => {
        console.log('No text found in DB')
        console.log(err.response.data.message)
      })
  }, [])
  return (
    <CenteredDiv>
      <h1 className='pt-12 text-3xl font-bold text-white'>
        Welcome to Yank Paste
      </h1>
      <div className='flex flex-col h-screen items-center pt-24'>
        <div>
          <TheTextArea text={text} setText={setText} />
          <div className='flex flex-row mt-5 gap-5'>
            <Button
              disabled={disabled}
              onClick={() => {
                //if (!confirm('Are you sure you want to save this text?')) return
                console.log(lastPostedItem)
                if (
                  lastPostedItem.current &&
                  lastPostedItem.current.text.S === text
                ) {
                  alert('Text already saved (no changes made)')
                  return
                }
                setDisabled(true)
                axios({
                  url: '/saveText',
                  method: 'POST',
                  data: { text: text },
                  headers: { 'Content-Type': 'application/json' },
                })
                  .then((res) => {
                    alert(res.data.message)
                    window.location.reload()
                  })
                  .catch((err) => {
                    alert(err.response.data.message)
                    setDisabled(false)
                  })
              }}
            >
              Save Text in DB
            </Button>
            <Button onClick={() => setText('')}>Clear Text</Button>
            <Button
              onClick={() => {
                if (text === '') {
                  alert('No text to copy!')
                  return
                }
                navigator.clipboard.writeText(text)
                alert('Text copied!')
              }}
            >
              Copy Text
            </Button>
          </div>
        </div>
      </div>
    </CenteredDiv>
  )
}

function CenteredDiv({ children }) {
  return (
    <div className='flex flex-col justify-center h-screen items-center'>
      {children}
    </div>
  )
}

function TheTextArea({ text, setText }) {
  return (
    <div className=''>
      <div className='mb-2 block'>
        <Label className='text-white' htmlFor='comment' value='Your message' />
      </div>
      <Textarea
        id='comment'
        placeholder='Leave a comment...'
        className='w-96'
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}
export default App
