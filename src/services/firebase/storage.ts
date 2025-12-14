import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from './config'

// Upload file and get download URL
export const uploadFile = async (
  path: string,
  file: File | Blob
): Promise<string> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

// Upload file with progress tracking
export const uploadFileWithProgress = (
  path: string,
  file: File | Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => {
        reject(error)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(downloadURL)
      }
    )
  })
}

// Upload profile image
export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<string> => {
  const path = `users/${userId}/profile.${file.name.split('.').pop()}`
  return uploadFile(path, file)
}

// Upload merchant image
export const uploadMerchantImage = async (
  merchantId: string,
  type: 'logo' | 'cover',
  file: File
): Promise<string> => {
  const path = `merchants/${merchantId}/${type}.${file.name.split('.').pop()}`
  return uploadFile(path, file)
}

// Upload product image
export const uploadProductImage = async (
  merchantId: string,
  productId: string,
  file: File
): Promise<string> => {
  const path = `merchants/${merchantId}/products/${productId}.${file.name.split('.').pop()}`
  return uploadFile(path, file)
}

// Delete file
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

// Get file download URL
export const getFileURL = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  return getDownloadURL(storageRef)
}
