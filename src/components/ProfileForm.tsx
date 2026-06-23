"use client"

import { useState } from "react"
import { updateUserProfile } from "@/app/actions/user"
import { Save } from "lucide-react"

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const displayAvatar = user.customAvatarUrl || user.image
  const displayName = user.nickName || user.name

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateUserProfile(formData)
    
    if (result.success) {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6 sm:p-8 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-700/50">
        <div className="relative group">
          <img 
            src={displayAvatar} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full border-4 border-gray-700 object-cover bg-gray-800"
          />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
          <p className="text-gray-400">Rol: <span className="text-tpm-primary font-medium">{user.role}</span></p>
          {user.discordId && (
            <a 
              href={`https://discordapp.com/users/${user.discordId}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-[#5865F2] hover:underline mt-2 inline-block bg-[#5865F2]/10 px-2 py-1 rounded"
            >
              Ver perfil en Discord
            </a>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="nickName" className="block text-sm font-medium text-gray-300 mb-2">
            Nick (Nombre de Jugador TPM)
          </label>
          <input
            type="text"
            id="nickName"
            name="nickName"
            defaultValue={user.nickName || ""}
            placeholder={user.name}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-tpm-primary focus:ring-1 focus:ring-tpm-primary transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Escribí el mismo nombre que usás en tu ficha de jugador para facilitar las estadísticas.
          </p>
        </div>

        <div>
          <label htmlFor="customAvatarUrl" className="block text-sm font-medium text-gray-300 mb-2">
            URL de Foto de Perfil (Opcional)
          </label>
          <input
            type="url"
            id="customAvatarUrl"
            name="customAvatarUrl"
            defaultValue={user.customAvatarUrl || ""}
            placeholder={user.image}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-tpm-primary focus:ring-1 focus:ring-tpm-primary transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Si dejás esto en blanco, usaremos tu foto de perfil de Discord.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-tpm-primary hover:bg-tpm-secondary text-white font-medium py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>

        {success && (
          <p className="text-green-400 text-sm mt-4 bg-green-400/10 p-3 rounded border border-green-400/20">
            ¡Perfil actualizado correctamente! Los cambios pueden tardar unos minutos en reflejarse en todos lados o podés volver a iniciar sesión.
          </p>
        )}
      </form>
    </div>
  )
}
