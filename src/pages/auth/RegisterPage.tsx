import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    const { error } = await signUp({ email, password, fullName, businessName })
    setLoading(false)

    if (error) {
      setError(traducirError(error))
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Casi listo">
        <p className="text-sm text-slate-600">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo para activar tu
          cuenta y luego inicia sesión.
        </p>
        <Button className="mt-6 w-full" onClick={() => navigate('/iniciar-sesion')}>
          Ir a iniciar sesión
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a calcular la rentabilidad de tu negocio">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Tu nombre"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Nombre del negocio"
          placeholder="Ej: M9 Fast Food"
          autoComplete="organization"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          hint="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/iniciar-sesion" className="font-medium text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}

function traducirError(message: string): string {
  if (message.toLowerCase().includes('already registered')) {
    return 'Ya existe una cuenta con este correo.'
  }
  return message
}
