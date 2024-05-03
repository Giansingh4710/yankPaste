import { Button } from 'flowbite-react'
import { Label, Table, Textarea } from 'flowbite-react'
import { FaPaste, FaRegCopy, FaSave, FaTimesCircle } from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'
import { ButtonLabel, CenteredDiv } from './helperComps'
import { displayHistoryText } from './helperFuncs'
import axios from 'axios'

function App() {
  const [text, setText] = useState('')
  const [list, setList] = useState([])
  const currItem = useRef()

  useEffect(() => {
    axios({
      url: '/getRows',
      method: 'GET',
    })
      .then((res) => {
        console.log(res.data.rows)
        setList(res.data.rows)
        setText(res.data.rows[0].text.S)
        currItem.current = res.data.rows[0]
      })
      .catch((err) => {
        console.log('No text found in DB')
        console.log(err.response.data.message)
      })
  }, [])

  function clearText() {
    setText('')
  }

  function saveText() {
    if (!confirm('Are you sure you want to save this text?')) {
      return
    }
    if (currItem.current && currItem.current.text.S === text) {
      alert('Text already saved (no changes made)')
      return
    }
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
      })
  }

  function copyText() {
    if (text === '') {
      alert('No text to copy!')
      return
    }
    navigator.clipboard.writeText(text)
    alert('Text copied!')
  }

  function pasteText() {
    navigator.clipboard
      .readText()
      .then((clipText) => setText(clipText))
      .catch((err) => {
        console.log(err)
        alert('Failed to paste text')
      })
  }

  return (
    <div className='flex flex-col pt-5 items-center'>
      <h1 className='text-3xl font-bold text-white'>Welcome to Yank Paste</h1>
      <div className='flex flex-col  items-center pt-12'>
        <TheTextArea text={text} setText={setText} />
        <div className='flex flex-row mt-5 gap-5'>
          <ButtonLabel text='Paste' Icon={FaPaste} action={pasteText} />
          <ButtonLabel text='Save' Icon={FaSave} action={saveText} />
          <ButtonLabel text='Clear' Icon={FaTimesCircle} action={clearText} />
          <ButtonLabel text='Copy' Icon={FaRegCopy} action={copyText} />
        </div>
        <History setText={setText} list={list} currItem={currItem} />
      </div>
    </div>
  )
}

function History({ setText, list, currItem }) {
  return (
    <div className=''>
      <Label className='text-white' value='History' />
      <div className='overflow-x-auto h-[20rem]'>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>Time</Table.HeadCell>
            <Table.HeadCell>Text</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {list.map((item, idx) => (
              <Table.Row className='bg-white' onClick={() => setText(item.text.S)}>
                <Table.Cell>{list.length - idx}</Table.Cell>
                <Table.Cell>
                  {new Date(parseInt(item.UnixTime.N)).toLocaleString()}
                </Table.Cell>
                <Table.Cell>{displayHistoryText(item.text.S)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

function TheTextArea({ text, setText }) {
  return (
    <div className='w-full'>
      <div className='mb-2 block'>
        <Label className='text-white' htmlFor='comment' value='Your message' />
      </div>
      <Textarea
        className='w-full'
        id='comment'
        placeholder='Leave a comment...'
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}

export default App
