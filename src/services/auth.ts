import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export interface AdminState {
  user: User | null
  /** The user has an `admins/{uid}` document. */
  isAdmin: boolean
  /** Display name from the admin document (falls back to the email). */
  name: string
}

/**
 * Who is signed in, and whether they are an admin. Admins are the users with an
 * `admins/{uid}` document — created by hand in the Firebase console (see README).
 */
export function subscribeAdminState(next: (state: AdminState) => void, fail: (error: Error) => void) {
  return onAuthStateChanged(
    auth,
    async (user) => {
      if (!user) {
        next({ user: null, isAdmin: false, name: '' })
        return
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid))
        const name = adminDoc.exists() && typeof adminDoc.data().name === 'string' ? adminDoc.data().name : ''
        next({ user, isAdmin: adminDoc.exists(), name: name || user.email || '' })
      } catch (error) {
        fail(error as Error)
      }
    },
    fail,
  )
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth)
}

/** Human-readable Mongolian message for Firebase auth errors. */
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Имэйл эсвэл нууц үг буруу байна'
    case 'auth/too-many-requests':
      return 'Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу'
    case 'auth/network-request-failed':
      return 'Интернэт холболтоо шалгана уу'
    default:
      return 'Нэвтрэх үед алдаа гарлаа'
  }
}
