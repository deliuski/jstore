export interface EmailSubscriber {
  id: string
  email: string
  productId: string
  productName: string
  createdAt: Date | null
  updatedAt: Date | null
}
