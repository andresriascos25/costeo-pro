import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function SettingsPage() {
  const { user, profile, updateProfile, updatePassword } = useAuth()

  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setBusinessName(profile?.business_name ?? '')
  }, [profile])

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    setProfileSaving(true)
    const { error } = await updateProfile({ fullName, businessName })
    setProfileSaving(false)
    if (error) {
      setProfileError(error)
      return
    }
    setProfileMessage('Perfil actualizado.')
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setPasswordSaving(true)
    const { error } = await updatePassword(newPassword)
    setPasswordSaving(false)
    if (error) {
      setPasswordError(error)
      return
    }
    setNewPassword('')
    setPasswordMessage('Contraseña actualizada.')
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
      <p className="mt-1 text-sm text-slate-500">Administra los datos de tu cuenta y tu negocio.</p>

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">Perfil</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleProfileSubmit}>
          <Input label="Correo electrónico" value={user?.email ?? ''} disabled readOnly />
          <Input label="Tu nombre" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input
            label="Nombre del negocio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          {profileError && <p className="text-sm font-medium text-red-600">{profileError}</p>}
          {profileMessage && <p className="text-sm font-medium text-green-700">{profileMessage}</p>}
          <div>
            <Button type="submit" loading={profileSaving}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">Cambiar contraseña</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
          <Input
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {passwordError && <p className="text-sm font-medium text-red-600">{passwordError}</p>}
          {passwordMessage && <p className="text-sm font-medium text-green-700">{passwordMessage}</p>}
          <div>
            <Button type="submit" loading={passwordSaving}>
              Actualizar contraseña
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
