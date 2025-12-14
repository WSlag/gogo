import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Send,
  Image,
  MapPin,
  MoreVertical,
  Phone,
  X,
} from 'lucide-react'
import { Button, Avatar, Spinner } from '@/components/ui'
import { useChat, type ChatMessage } from '@/hooks/useChat'
import { useAuthStore } from '@/store/authStore'
import { useImageUpload } from '@/hooks/useImageUpload'

interface ChatWindowProps {
  chatId: string
  otherPartyName: string
  otherPartyImage?: string
  onClose: () => void
  onCall?: () => void
}

export function ChatWindow({
  chatId,
  otherPartyName,
  otherPartyImage,
  onClose,
  onCall,
}: ChatWindowProps) {
  const { user } = useAuthStore()
  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    sendImage,
    sendLocation,
    markAsRead,
  } = useChat(chatId)
  const { uploadImage, uploadState } = useImageUpload()

  const [inputMessage, setInputMessage] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages, markAsRead])

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return

    const success = await sendMessage(inputMessage)
    if (success) {
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadImage(file)
    if (url) {
      await sendImage(url)
    }
  }

  const handleShareLocation = async () => {
    setShowOptions(false)

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await sendLocation(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.error('Location error:', error)
        alert('Failed to get your location')
      }
    )
  }

  const formatTime = (timestamp: Date | { toDate: () => Date }) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate()
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === user?.uid
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <Avatar name={otherPartyName} src={otherPartyImage} size="sm" />

        <div className="flex-1">
          <p className="font-semibold text-gray-900">{otherPartyName}</p>
          <p className="text-xs text-gray-500">Online</p>
        </div>

        {onCall && (
          <button
            onClick={onCall}
            className="p-2 rounded-full hover:bg-gray-100 text-primary-600"
          >
            <Phone className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMyMessage(message)
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'
                }`}
              >
                {message.messageType === 'image' && message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="rounded-lg max-w-full mb-2"
                  />
                )}

                {message.messageType === 'location' && message.location && (
                  <a
                    href={`https://maps.google.com/?q=${message.location.lat},${message.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 underline"
                  >
                    <MapPin className="h-4 w-4" />
                    View Location
                  </a>
                )}

                {message.messageType !== 'location' && (
                  <p className="text-sm">{message.message}</p>
                )}

                <p
                  className={`text-xs mt-1 ${
                    isMyMessage(message) ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {message.createdAt && formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Upload progress */}
      {uploadState.status === 'uploading' && (
        <div className="px-4 py-2 bg-blue-50">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-blue-600">
              Uploading... {Math.round(uploadState.progress)}%
            </span>
          </div>
        </div>
      )}

      {/* Options menu */}
      {showOptions && (
        <div className="absolute top-14 right-4 bg-white shadow-lg rounded-lg py-2 z-10">
          <button
            onClick={() => {
              fileInputRef.current?.click()
              setShowOptions(false)
            }}
            className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50"
          >
            <Image className="h-5 w-5 text-gray-500" />
            <span className="text-sm">Send Image</span>
          </button>
          <button
            onClick={handleShareLocation}
            className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50"
          >
            <MapPin className="h-5 w-5 text-gray-500" />
            <span className="text-sm">Share Location</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <Image className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />

          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            className={`p-2 rounded-full ${
              inputMessage.trim() && !isSending
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isSending ? <Spinner size="sm" /> : <Send className="h-5 w-5" />}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ChatWindow
