import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  IndianRupee,
  Package,
  UserRound,
  Filter
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'
import Toast from '../components/Toast'

const columns = ['New', 'Preparing', 'Ready', 'In Transit', 'Delivered']

export default function Orders() {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/orders')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        return response.json()
      })
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching orders:', error)
        setError('Could not load orders from the backend.')
        setLoading(false)
      })
  }, [])

  const filtered =
    selected === 'All'
      ? rows
      : rows.filter((order) => order.status === selected)

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <PageHeader
        eyebrow="Buyer demand"
        title="Orders"
        description="Every order is handled by the FPO: accept, aggregate, prepare, dispatch and close the transaction."
        action={
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            <Filter size={14} />
            {filtered.length} shown
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', ...columns].map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setSelected(status)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
              selected === status
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Loading orders...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
          <p className="mt-2 text-xs text-red-500">
            Make sure your backend is running on port 5000.
          </p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Package
            size={32}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-sm font-bold text-slate-700">
            No orders found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Orders added to Firestore will appear here.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-5">

          {columns.map((column) => (
            <div
              key={column}
              className="min-h-56 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-sm font-bold text-slate-800">
                  {column}
                </h3>

                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {
                    filtered.filter(
                      (order) => order.status === column
                    ).length
                  }
                </span>

              </div>

              <div className="space-y-3">

                {filtered
                  .filter((order) => order.status === column)
                  .map((order) => (

                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-2">

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.buyer}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            #{order.id}
                          </p>
                        </div>

                        <span className="text-xl">
                          {order.emoji || '📦'}
                        </span>

                      </div>

                      <div className="mt-3 rounded-lg bg-slate-50 p-2">

                        <p className="text-xs font-semibold text-slate-800">
                          {order.quantity} kg {order.product}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500">
                          ₹
                          {(
                            order.quantity * order.price
                          ).toLocaleString('en-IN')}{' '}
                          · {order.delivery}
                        </p>

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <StatusBadge status={order.status} />

                        <span className="text-[11px] font-semibold text-emerald-700">
                          Open
                        </span>

                      </div>

                    </Link>

                  ))}

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}


export function OrderDetails() {

  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [accepted, setAccepted] = useState(false)
  const [prepared, setPrepared] = useState(false)
  const [deliveryReady, setDeliveryReady] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {

    fetch('http://localhost:5000/orders')
      .then((response) => {

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        return response.json()
      })

      .then((data) => {

        const foundOrder = data.find(
          (item) => item.id === orderId
        )

        if (!foundOrder) {
          setError('Order not found.')
          setLoading(false)
          return
        }

        setOrder(foundOrder)

        setAccepted(
          foundOrder.status !== 'New'
        )

        setPrepared(
          foundOrder.status === 'Ready' ||
          foundOrder.status === 'In Transit' ||
          foundOrder.status === 'Delivered'
        )

        setDeliveryReady(
          foundOrder.status === 'In Transit' ||
          foundOrder.status === 'Delivered'
        )

        setLoading(false)

      })

      .catch((error) => {

        console.error(
          'Error fetching order:',
          error
        )

        setError(
          'Could not load this order from the backend.'
        )

        setLoading(false)

      })

  }, [orderId])


  if (loading) {

    return (
      <div className="mx-auto max-w-6xl p-8 text-center">

        <p className="text-sm font-semibold text-slate-600">
          Loading order...
        </p>

      </div>
    )

  }


  if (error || !order) {

    return (
      <div className="mx-auto max-w-6xl space-y-4 p-8">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Back to orders
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <p className="text-sm font-bold text-red-700">
            {error || 'Order not found'}
          </p>

        </div>

      </div>
    )

  }


  const activeStatus =
    order.status === 'New' && !accepted
      ? 'New'
      : !prepared
        ? 'Preparing'
        : !deliveryReady
          ? 'Ready'
          : order.status === 'Delivered'
            ? 'Delivered'
            : 'In Transit'


  const show = (message) => {

    setToast(message)

    setTimeout(
      () => setToast(''),
      2600
    )

  }


  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to orders
      </button>


      <PageHeader
        eyebrow={`Order #${order.id}`}
        title={order.buyer}
        description={`${order.buyerType || 'Buyer'} · ${order.destination || 'Delivery location'}`}
        action={
          <StatusBadge status={activeStatus} />
        }
      />


      <div className="grid gap-6 lg:grid-cols-3">

        <section className="space-y-6 lg:col-span-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <span className="text-3xl">
                {order.emoji || '📦'}
              </span>

              <div>

                <p className="font-bold text-slate-900">
                  {order.quantity} kg {order.product}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Grade A · ₹{order.price}/kg
                </p>

              </div>

            </div>


            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[11px] text-slate-500">
                  Order total
                </p>

                <p className="mt-1 flex items-center gap-1 text-lg font-bold">

                  <IndianRupee size={16} />

                  {(
                    order.quantity * order.price
                  ).toLocaleString('en-IN')}

                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[11px] text-slate-500">
                  Required by
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm font-bold">

                  <Clock3 size={14} />

                  {order.delivery}

                </p>

              </div>


              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[11px] text-slate-500">
                  Delivery
                </p>

                <p className="mt-1 text-sm font-bold">
                  {order.destination}
                </p>

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="font-bold text-slate-900">
              Fulfilment
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Aggregate the order using FPO inventory and member contributions.
            </p>


            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-100 p-4">

                <p className="text-xs text-slate-500">
                  Required
                </p>

                <p className="mt-1 text-xl font-bold">
                  {order.quantity} kg
                </p>

              </div>


              <div className="rounded-xl border border-slate-100 p-4">

                <p className="text-xs text-slate-500">
                  FPO stock
                </p>

                <p className="mt-1 text-xl font-bold">
                  300 kg
                </p>

              </div>


              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                <p className="text-xs text-emerald-700">
                  Member contribution
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-800">
                  {Math.max(order.quantity - 300, 0)} kg ✓
                </p>

              </div>

            </div>


            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className={`h-full rounded-full bg-emerald-600 transition-all ${
                  prepared
                    ? 'w-full'
                    : accepted
                      ? 'w-3/5'
                      : 'w-0'
                }`}
              />

            </div>


            <p className="mt-2 text-xs font-medium text-emerald-700">

              {prepared
                ? `${order.quantity} / ${order.quantity} kg fulfilled`
                : accepted
                  ? '300 kg FPO stock confirmed; member aggregation in progress'
                  : 'Awaiting FPO acceptance'}

            </p>

          </div>

        </section>


        <aside className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="font-bold text-slate-900">
              Order timeline
            </h2>


            <div className="mt-5 space-y-4">

              <TimelineItem
                done
                title="Order received"
                time="10:12 AM"
              />

              <TimelineItem
                done={accepted}
                active={!accepted}
                title="Accepted by FPO"
                time={
                  accepted
                    ? '10:16 AM'
                    : 'Waiting'
                }
              />

              <TimelineItem
                done={prepared}
                active={accepted && !prepared}
                title="Preparing"
                time={
                  prepared
                    ? '12:45 PM'
                    : 'Waiting'
                }
              />

              <TimelineItem
                done={deliveryReady}
                active={prepared && !deliveryReady}
                title="Ready for pickup"
                time={
                  deliveryReady
                    ? '1:10 PM'
                    : 'Waiting'
                }
              />

              <TimelineItem
                done={
                  order.status === 'Delivered'
                }
                title="Delivered"
                time={
                  order.status === 'Delivered'
                    ? '4:02 PM'
                    : 'Waiting'
                }
              />

            </div>

          </div>


          <div className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm">

            <div className="flex items-center gap-2">

              <UserRound size={18} />

              <span className="text-sm font-semibold">
                FPO actions
              </span>

            </div>


            {!accepted && (

              <button
                type="button"
                onClick={() => {

                  setAccepted(true)

                  show(
                    'Order accepted. Start aggregation with member farmers.'
                  )

                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-emerald-50"
              >
                Accept order
                <ArrowRight size={16} />
              </button>

            )}


            {accepted && !prepared && (

              <button
                type="button"
                onClick={() => {

                  setPrepared(true)

                  show(
                    'Order marked as prepared. It is ready for logistics handoff.'
                  )

                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-emerald-50"
              >
                Mark as prepared
                <Package size={16} />
              </button>

            )}


            {accepted &&
              prepared &&
              !deliveryReady && (

                <button
                  type="button"
                  onClick={() => {

                    setDeliveryReady(true)

                    show(
                      'Order is ready for pickup.'
                    )

                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-emerald-50"
                >
                  Ready for pickup
                  <ArrowRight size={16} />
                </button>

              )}


            {accepted && prepared && (

              <Link
                to="/logistics"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Open logistics
                <ArrowRight size={16} />
              </Link>

            )}

          </div>

        </aside>

      </div>


      <Toast
        message={toast}
        onClose={() => setToast('')}
      />

    </div>
  )
}


function TimelineItem({
  done,
  active,
  title,
  time
}) {

  return (

    <div className="flex gap-3">

      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          done
            ? 'bg-emerald-100 text-emerald-700'
            : active
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-400'
        }`}
      >
        {done
          ? '✓'
          : active
            ? '●'
            : '○'}
      </div>


      <div>

        <p
          className={`text-sm font-semibold ${
            done || active
              ? 'text-slate-800'
              : 'text-slate-400'
          }`}
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {time}
        </p>

      </div>

    </div>

  )
}