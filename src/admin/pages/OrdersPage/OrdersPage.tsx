import { useSearchParams } from 'react-router'
import { PageError, PageLoader } from '../../../components/PageStatus/PageStatus'
import { useOrders } from '../../../hooks/data'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../../../models/order'
import { AdminPageHeader } from '../../components/AdminPageHeader/AdminPageHeader'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FilterChips, type ChipOption } from '../../components/FilterChips/FilterChips'
import { Select } from '../../components/Form/Select'
import { SearchField } from '../../components/SearchField/SearchField'
import { adminTitle } from '../../components/title'
import {
  PAGE_SIZE,
  PAYMENT_METHODS,
  matchesQuery,
  parseMethod,
  parsePage,
  parseStatus,
  useSearchDraft,
  withParam,
  type FilterParam,
  type StatusFilter,
} from './orders'
import { OrdersTable } from './OrdersTable'
import { Pager } from './Pager'
import s from './OrdersPage.module.css'

const METHOD_OPTIONS = [
  { value: 'all', label: 'Бүх төлбөр' },
  ...PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] })),
]

/** Every order, filtered by status / payment method / search — all kept in the URL (?status=&method=&q=&page=). */
export function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const { data, error, loading } = useOrders(true)
  const status = parseStatus(params.get('status'))
  const method = parseMethod(params.get('method'))
  const query = params.get('q') ?? ''
  const [search, setSearch] = useSearchDraft(query)

  const setParam = (key: FilterParam, value: string | null, replace = false) =>
    setParams((current) => withParam(current, key, value), { replace })

  const orders = data ?? []
  const matching = orders.filter(
    (order) => (method === 'all' || order.payment.method === method) && matchesQuery(order, query),
  )
  const shown = status === 'all' ? matching : matching.filter((order) => order.status === status)
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const page = Math.min(parsePage(params.get('page')), pageCount)
  const rows = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const chips: ChipOption<StatusFilter>[] = [
    { value: 'all', label: 'Бүгд', count: matching.length },
    ...ORDER_STATUS_FLOW.map((value) => ({
      value,
      label: ORDER_STATUS_LABELS[value],
      count: matching.filter((order) => order.status === value).length,
    })),
  ]

  const changeSearch = (value: string) => {
    setSearch(value)
    setParam('q', value, true)
  }

  const goToPage = (next: number) => {
    setParam('page', next > 1 ? String(next) : null)
    window.scrollTo({ top: 0 })
  }

  const clearFilters = () => {
    setSearch('')
    setParams(new URLSearchParams())
  }

  return (
    <>
      <title>{adminTitle('Захиалга')}</title>
      <AdminPageHeader
        title="Захиалга"
        subtitle={data && `Нийт ${data.length}`}
        actions={
          <SearchField
            className={s.search}
            value={search}
            onChange={changeSearch}
            placeholder="Дугаар, нэр, утас хайх"
            label="Захиалга хайх"
          />
        }
      />

      {error ? (
        <PageError />
      ) : loading ? (
        <PageLoader />
      ) : (
        <Card className={s.card}>
          <div className={s.toolbar}>
            <FilterChips
              options={chips}
              value={status}
              onChange={(value) => setParam('status', value === 'all' ? null : value)}
              label="Төлөвөөр шүүх"
            />
            <Select
              label="Төлбөрийн хэлбэр"
              hideLabel
              className={s.method}
              value={method}
              options={METHOD_OPTIONS}
              onChange={(event) => setParam('method', event.target.value === 'all' ? null : event.target.value)}
            />
          </div>
          <p className="visually-hidden" role="status">
            {shown.length} захиалга
          </p>

          {orders.length === 0 ? (
            <EmptyState title="Захиалга алга" text="Дэлгүүрээс захиалга ирэхэд энд харагдана." />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Захиалга олдсонгүй"
              text="Энэ шүүлтүүрт тохирох захиалга алга. Хайлт эсвэл шүүлтүүрээ өөрчилнө үү."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Шүүлтүүр арилгах
                </Button>
              }
            />
          ) : (
            <>
              <OrdersTable orders={rows} backLabel="Захиалга" />
              <Pager page={page} pageCount={pageCount} total={shown.length} pageSize={PAGE_SIZE} onChange={goToPage} />
            </>
          )}
        </Card>
      )}
    </>
  )
}
