'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/context/UserProvider'
import { Environment, Html, KeyboardControls } from '@react-three/drei'

// React Components
import { Modal } from '../../src/components/elements/Modal'
import { Book } from '../../src/components/elements/Book'

// React Three Fiber Components
const BookModel = dynamic(() => import('@/components/canvas/book/Book').then((mod) => mod.Book), { ssr: false })
const KeysModels = dynamic(() => import('@/components/canvas/world/Keys').then((mod) => mod.Key), { ssr: false })
const ImageWall = dynamic(() => import('@/components/canvas/stickers/ZeusImg').then((mod) => mod.ZeusWall), {
  ssr: false,
})
const World = dynamic(() => import('@/components/canvas/world/World').then((mod) => mod.ModelWorld), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const Player = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Player), { ssr: false })
const keyboardControls = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
]
// cambio para el commit

export default function Page() {
  const { user, setUser } = useContext(UserContext)
  const router = useRouter()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isImgOpen, setIsImgOpen] = useState(false)
  const env = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/industrial_sunset_02_puresky_4k.hdr'

  const handleshowImg = () => {
    setIsBookOpen(!isBookOpen)
    !isImgOpen
      ? setTimeout(() => {
          setIsImgOpen(!isImgOpen)
        }, 3000)
      : setIsImgOpen(!isImgOpen)
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    if (typeof window !== 'undefined') {
      handleResize() // Obtener el tamaño de la ventana inicial
      window.addEventListener('resize', handleResize) // Actualizar el tamaño de la ventana al cambiar su tamaño
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize) // Eliminar el evento de cambio de tamaño al desmontar el componente
      }
    }
  }, [])

  //Verifica que haya un usuario en el localstorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // else {
    //   //Si no hay usuario en el localstorage, lo redirige al login
    //   router.push('/login')
    // }
  }, [])

  const [isShiftPressed, setIsShiftPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Limpia los listeners al desmontar el componente
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <>
      {/* <div className='absolute z-20 top-0 right-[400px] left-0 bottom-[300px] flex items-center justify-center'>
        <div className='bg-red-500 w-32 h-32'></div>
      </div > */}
      <div className='absolute z-20 top-0 right-0'>
        <Modal />
      </div>
      <div className='absolute z-20 bottom-0 right-0'>
        <Book
          onClick={() => {
            handleshowImg()
          }}
        />
      </div>
      <div className='z-10 mx-auto flex w-full h-full flex-col flex-wrap items-center'>
        <View
          orbit
          className='absolute flex h-full w-full flex-col items-center justify-center bg-blue-700 bg-opacity-50'
          isBookOpen={isBookOpen}
        >
          <Environment files={env} ground={{ height: 5, radius: 4096, scale:400 }} />
          <KeyboardControls map={keyboardControls}>
            <World />
            <KeysModels scale={0.01} position-y={4} />
            {isBookOpen && <BookModel />}
            {isImgOpen && <ImageWall />}
            <Player walkVelocity={isShiftPressed ? 15 : 5} />
            {isBookOpen && <BookModel />}
            {isImgOpen && <ImageWall />}
            <Common />
          </KeyboardControls>
        </View>
        {/* </div> */}
      </div>
    </>
  )
}
