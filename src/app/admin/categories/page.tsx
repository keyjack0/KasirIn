'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiLoaderLine, RiListUnordered } from 'react-icons/ri'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { error } = await supabase.from('categories').insert({ name: newName.trim() })
    if (error) { toast.error('Gagal menambahkan'); setSaving(false); return }
    toast.success('Kategori ditambahkan')
    setNewName('')
    setSaving(false)
    fetch()
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    const { error } = await supabase.from('categories').update({ name: editName }).eq('id', id)
    if (error) { toast.error('Gagal memperbarui'); return }
    toast.success('Kategori diperbarui')
    setEditId(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error('Gagal menghapus. Mungkin masih digunakan produk.'); return }
    toast.success('Kategori dihapus')
    fetch()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kategori</h1>
        <p className="text-gray-500 text-sm mt-0.5">Kelola kategori produk</p>
      </div>

      {/* Add form */}
      <div className="card p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Tambah Kategori</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="input-field flex-1"
            placeholder="Nama kategori"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? <RiLoaderLine className="animate-spin" /> : <RiAddLine />}
            Tambah
          </button>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <RiLoaderLine className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <RiListUnordered className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">Belum ada kategori</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
                {editId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.id)}
                      className="input-field flex-1"
                      autoFocus
                    />
                    <button onClick={() => handleEdit(cat.id)} className="btn-primary text-xs px-3 py-2">Simpan</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-xs px-3 py-2">Batal</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
