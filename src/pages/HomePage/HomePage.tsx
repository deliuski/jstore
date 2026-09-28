import { BRAND } from '../../data/site'
import { AnnouncementBar } from './AnnouncementBar'
import { HeroSlider } from './HeroSlider'
import { NewArrivals } from './NewArrivals'

export function HomePage() {
  return (
    <>
      <title>{`${BRAND.name} — гутлын дэлгүүр`}</title>
      <HeroSlider />
      <AnnouncementBar />
      <NewArrivals />
    </>
  )
}
