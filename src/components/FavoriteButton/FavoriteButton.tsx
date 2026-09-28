import { useShop } from '../../context/shop'
import { HeartIcon } from '../icons'

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const { favorites, toggleFavorite } = useShop()
  const saved = favorites.has(productId)

  return (
    <button
      type="button"
      className={className}
      aria-label="Хадгалах"
      aria-pressed={saved}
      onClick={() => toggleFavorite(productId)}
    >
      <HeartIcon size={20} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
