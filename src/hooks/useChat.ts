// Chat/messaging hook for real-time communication
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  subscribeToCollection,
  setDocument,
  getDocuments,
  collections,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from '@/services/firebase/firestore'
import { db } from '@/services/firebase/config'
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderType: 'customer' | 'driver' | 'merchant' | 'support'
  message: string
  messageType: 'text' | 'image' | 'location' | 'system'
  imageUrl?: string
  location?: { lat: number; lng: number }
  read: boolean
  createdAt: Timestamp
}

export interface Chat {
  id: string
  type: 'ride' | 'order' | 'support'
  referenceId: string // rideId or orderId
  participants: string[]
  participantNames: Record<string, string>
  lastMessage?: string
  lastMessageAt?: Timestamp
  unreadCount: Record<string, number>
  status: 'active' | 'closed'
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface UseChatReturn {
  messages: ChatMessage[]
  chat: Chat | null
  isLoading: boolean
  isSending: boolean
  error: string | null
  sendMessage: (message: string, type?: 'text' | 'image' | 'location') => Promise<boolean>
  sendImage: (imageUrl: string) => Promise<boolean>
  sendLocation: (lat: number, lng: number) => Promise<boolean>
  markAsRead: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export function useChat(chatId: string | undefined): UseChatReturn {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chat, setChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loadedMessagesRef = useRef<number>(50)

  // Subscribe to chat document
  useEffect(() => {
    if (!chatId) {
      setIsLoading(false)
      return
    }

    const chatRef = doc(db, 'chats', chatId)
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setChat({ id: doc.id, ...doc.data() } as Chat)
      } else {
        setError('Chat not found')
      }
    })

    return () => unsubscribe()
  }, [chatId])

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(loadedMessagesRef.current)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]

      // Reverse to show oldest first
      setMessages(messagesList.reverse())
      setHasMore(snapshot.docs.length >= loadedMessagesRef.current)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [chatId])

  // Send a text message
  const sendMessage = useCallback(async (
    message: string,
    type: 'text' | 'image' | 'location' = 'text'
  ): Promise<boolean> => {
    if (!chatId || !user || !message.trim()) return false

    setIsSending(true)
    setError(null)

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        chatId,
        senderId: user.uid,
        senderType: 'customer', // Would be dynamic based on user role
        message: message.trim(),
        messageType: type,
        read: false,
        createdAt: serverTimestamp(),
      })

      // Update chat last message
      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: message.trim().substring(0, 100),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setIsSending(false)
      return true
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message')
      setIsSending(false)
      return false
    }
  }, [chatId, user])

  // Send an image message
  const sendImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    if (!chatId || !user) return false

    setIsSending(true)
    setError(null)

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        chatId,
        senderId: user.uid,
        senderType: 'customer',
        message: '📷 Image',
        messageType: 'image',
        imageUrl,
        read: false,
        createdAt: serverTimestamp(),
      })

      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: '📷 Image',
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setIsSending(false)
      return true
    } catch (err) {
      console.error('Failed to send image:', err)
      setError('Failed to send image')
      setIsSending(false)
      return false
    }
  }, [chatId, user])

  // Send a location message
  const sendLocation = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    if (!chatId || !user) return false

    setIsSending(true)
    setError(null)

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        chatId,
        senderId: user.uid,
        senderType: 'customer',
        message: '📍 Location shared',
        messageType: 'location',
        location: { lat, lng },
        read: false,
        createdAt: serverTimestamp(),
      })

      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: '📍 Location shared',
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setIsSending(false)
      return true
    } catch (err) {
      console.error('Failed to send location:', err)
      setError('Failed to send location')
      setIsSending(false)
      return false
    }
  }, [chatId, user])

  // Mark messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!chatId || !user) return

    try {
      const unreadMessages = messages.filter(m => !m.read && m.senderId !== user.uid)

      await Promise.all(
        unreadMessages.map(m => {
          const messageRef = doc(db, 'chats', chatId, 'messages', m.id)
          return updateDoc(messageRef, { read: true })
        })
      )

      // Update unread count in chat
      if (chat) {
        const chatRef = doc(db, 'chats', chatId)
        await updateDoc(chatRef, {
          [`unreadCount.${user.uid}`]: 0,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }, [chatId, user, messages, chat])

  // Load more messages
  const loadMore = useCallback(async (): Promise<void> => {
    loadedMessagesRef.current += 50
    // The useEffect with the listener will automatically load more
  }, [])

  return {
    messages,
    chat,
    isLoading,
    isSending,
    error,
    sendMessage,
    sendImage,
    sendLocation,
    markAsRead,
    loadMore,
    hasMore,
  }
}

// Create or get existing chat for a ride
export async function getOrCreateRideChat(
  rideId: string,
  passengerId: string,
  passengerName: string,
  driverId: string,
  driverName: string
): Promise<string> {
  try {
    // Check for existing chat
    const existingChats = await getDocuments<Chat>(
      'chats',
      [
        where('type', '==', 'ride'),
        where('referenceId', '==', rideId),
        where('status', '==', 'active'),
      ]
    )

    if (existingChats.length > 0) {
      return existingChats[0].id
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      type: 'ride',
      referenceId: rideId,
      participants: [passengerId, driverId],
      participantNames: {
        [passengerId]: passengerName,
        [driverId]: driverName,
      },
      unreadCount: {
        [passengerId]: 0,
        [driverId]: 0,
      },
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return chatRef.id
  } catch (error) {
    console.error('Failed to create chat:', error)
    throw error
  }
}

// Create or get existing chat for an order
export async function getOrCreateOrderChat(
  orderId: string,
  customerId: string,
  customerName: string,
  riderId: string,
  riderName: string
): Promise<string> {
  try {
    const existingChats = await getDocuments<Chat>(
      'chats',
      [
        where('type', '==', 'order'),
        where('referenceId', '==', orderId),
        where('status', '==', 'active'),
      ]
    )

    if (existingChats.length > 0) {
      return existingChats[0].id
    }

    const chatRef = await addDoc(collection(db, 'chats'), {
      type: 'order',
      referenceId: orderId,
      participants: [customerId, riderId],
      participantNames: {
        [customerId]: customerName,
        [riderId]: riderName,
      },
      unreadCount: {
        [customerId]: 0,
        [riderId]: 0,
      },
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return chatRef.id
  } catch (error) {
    console.error('Failed to create chat:', error)
    throw error
  }
}

// Hook to get all chats for current user
export function useChats(): {
  chats: Chat[]
  isLoading: boolean
  totalUnread: number
} {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setChats([])
      setIsLoading(false)
      return
    }

    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'active'),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[]

      setChats(chatsList)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const totalUnread = chats.reduce((sum, chat) => {
    return sum + (chat.unreadCount?.[user?.uid || ''] || 0)
  }, 0)

  return { chats, isLoading, totalUnread }
}
