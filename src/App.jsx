import { BrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/avyo/AppLayout'

export default function App() {
  return <BrowserRouter><AppLayout><h1 className="font-heading text-3xl font-bold">AVYO Personal</h1></AppLayout></BrowserRouter>
}
