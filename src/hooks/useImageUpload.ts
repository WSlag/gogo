// Image upload hook with Firebase Storage integration
import { useState, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/services/firebase/config'
import { useAuthStore } from '@/store/authStore'

interface UploadProgress {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  url: string | null
  error: string | null
}

interface UseImageUploadReturn {
  uploadState: UploadProgress
  uploadImage: (file: File, path?: string) => Promise<string | null>
  uploadMultiple: (files: File[], basePath?: string) => Promise<string[]>
  deleteImage: (url: string) => Promise<boolean>
  reset: () => void
}

// Compress image before upload
async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}_${random}.${extension}`
}

export function useImageUpload(): UseImageUploadReturn {
  const { user } = useAuthStore()
  const [uploadState, setUploadState] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
    url: null,
    error: null,
  })

  const reset = useCallback(() => {
    setUploadState({
      progress: 0,
      status: 'idle',
      url: null,
      error: null,
    })
  }, [])

  const uploadImage = useCallback(async (
    file: File,
    customPath?: string
  ): Promise<string | null> => {
    if (!user) {
      setUploadState({
        progress: 0,
        status: 'error',
        url: null,
        error: 'User not authenticated',
      })
      return null
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadState({
        progress: 0,
        status: 'error',
        url: null,
        error: 'Please select an image file',
      })
      return null
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadState({
        progress: 0,
        status: 'error',
        url: null,
        error: 'Image size must be less than 10MB',
      })
      return null
    }

    setUploadState({
      progress: 0,
      status: 'uploading',
      url: null,
      error: null,
    })

    try {
      // Compress image
      const compressedBlob = await compressImage(file)

      // Generate path
      const filename = generateFilename(file.name)
      const path = customPath || `users/${user.uid}/images/${filename}`
      const storageRef = ref(storage, path)

      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
          contentType: 'image/jpeg',
        })

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadState((prev) => ({
              ...prev,
              progress,
            }))
          },
          (error) => {
            console.error('Upload error:', error)
            setUploadState({
              progress: 0,
              status: 'error',
              url: null,
              error: 'Failed to upload image',
            })
            reject(error)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setUploadState({
                progress: 100,
                status: 'success',
                url: downloadURL,
                error: null,
              })
              resolve(downloadURL)
            } catch (error) {
              console.error('Failed to get download URL:', error)
              setUploadState({
                progress: 0,
                status: 'error',
                url: null,
                error: 'Failed to get image URL',
              })
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      console.error('Upload error:', error)
      setUploadState({
        progress: 0,
        status: 'error',
        url: null,
        error: 'Failed to process image',
      })
      return null
    }
  }, [user])

  const uploadMultiple = useCallback(async (
    files: File[],
    basePath?: string
  ): Promise<string[]> => {
    const urls: string[] = []

    for (const file of files) {
      const path = basePath ? `${basePath}/${generateFilename(file.name)}` : undefined
      const url = await uploadImage(file, path)
      if (url) {
        urls.push(url)
      }
    }

    return urls
  }, [uploadImage])

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/)
      if (!pathMatch) {
        console.error('Invalid storage URL')
        return false
      }

      const path = decodeURIComponent(pathMatch[1])
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
      return true
    } catch (error) {
      console.error('Failed to delete image:', error)
      return false
    }
  }, [])

  return {
    uploadState,
    uploadImage,
    uploadMultiple,
    deleteImage,
    reset,
  }
}

// Profile image upload with specific path
export function useProfileImageUpload() {
  const { user } = useAuthStore()
  const { uploadImage, uploadState, reset, deleteImage } = useImageUpload()

  const uploadProfileImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null
    return uploadImage(file, `users/${user.uid}/profile.jpg`)
  }, [user, uploadImage])

  return {
    uploadProfileImage,
    uploadState,
    reset,
    deleteImage,
  }
}

// Document upload for driver verification
export function useDocumentUpload() {
  const { user } = useAuthStore()
  const { uploadImage, uploadMultiple, uploadState, reset, deleteImage } = useImageUpload()

  const uploadDocument = useCallback(async (
    file: File,
    documentType: 'license' | 'registration' | 'insurance' | 'id'
  ): Promise<string | null> => {
    if (!user) return null
    return uploadImage(file, `drivers/${user.uid}/documents/${documentType}.jpg`)
  }, [user, uploadImage])

  const uploadVehiclePhotos = useCallback(async (files: File[]): Promise<string[]> => {
    if (!user) return []
    return uploadMultiple(files, `drivers/${user.uid}/vehicle`)
  }, [user, uploadMultiple])

  return {
    uploadDocument,
    uploadVehiclePhotos,
    uploadState,
    reset,
    deleteImage,
  }
}

// Product/menu image upload for merchants
export function useMerchantImageUpload(merchantId: string) {
  const { uploadImage, uploadMultiple, uploadState, reset, deleteImage } = useImageUpload()

  const uploadProductImage = useCallback(async (
    file: File,
    productId: string
  ): Promise<string | null> => {
    return uploadImage(file, `merchants/${merchantId}/products/${productId}.jpg`)
  }, [merchantId, uploadImage])

  const uploadMenuImages = useCallback(async (
    files: File[],
    category: string
  ): Promise<string[]> => {
    return uploadMultiple(files, `merchants/${merchantId}/menu/${category}`)
  }, [merchantId, uploadMultiple])

  const uploadBannerImage = useCallback(async (file: File): Promise<string | null> => {
    return uploadImage(file, `merchants/${merchantId}/banner.jpg`)
  }, [merchantId, uploadImage])

  return {
    uploadProductImage,
    uploadMenuImages,
    uploadBannerImage,
    uploadState,
    reset,
    deleteImage,
  }
}
