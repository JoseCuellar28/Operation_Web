"use client"

import { useState } from "react"
import { CollaboratorModal } from "@/components/collaborator-modal"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(true)

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      {isModalOpen && <CollaboratorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {!isModalOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Abrir Modal
        </button>
      )}
    </main>
  )
}
