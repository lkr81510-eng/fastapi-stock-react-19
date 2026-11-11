import { useEffect, useState } from 'react'

// vite.config.js의 프록시를 거쳐 FastAPI(localhost:8000)의 /samsung으로 전달된다
const API_URL = '/api/samsung'

const formatNumber = (value) =>
  value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })

function App() {
  const [stock, setStock] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStock() {
      try {
        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`서버 응답 오류 (${response.status})`)
        }
        setStock(await response.json())
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      }
    }

    loadStock()
    return () => controller.abort()
  }, [])

  if (error) {
    return (
      <main>
        <p className="error">데이터를 불러오지 못했습니다. {error}</p>
      </main>
    )
  }

  if (!stock) {
    return (
      <main>
        <p>불러오는 중...</p>
      </main>
    )
  }

  // 서버는 오래된 날짜부터 보내므로 최신 날짜가 위로 오도록 뒤집는다
  const prices = [...stock.prices].reverse()

  return (
    <main>
      <h1>
        {stock.name} <small>{stock.code}</small>
      </h1>
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>시가</th>
            <th>고가</th>
            <th>저가</th>
            <th>종가</th>
            <th>거래량</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => (
            <tr key={price.date}>
              <td>{price.date}</td>
              <td>{formatNumber(price.open)}</td>
              <td>{formatNumber(price.high)}</td>
              <td>{formatNumber(price.low)}</td>
              <td>{formatNumber(price.close)}</td>
              <td>{formatNumber(price.volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default App
