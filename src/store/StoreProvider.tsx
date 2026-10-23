'use client';
import {useEffect} from 'react';
import {useGameStore} from './gameStore';
export function StoreProvider({children}:{children:React.ReactNode}){useEffect(()=>{void useGameStore.persist.rehydrate();if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)void navigator.serviceWorker.register('/sw.js').catch(()=>{});},[]);return children;}
