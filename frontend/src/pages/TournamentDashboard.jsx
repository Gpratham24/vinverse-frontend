/**
 * Tournament Dashboard - Three sections: All, Organized, Joined.
 * CRUD operations with join/leave functionality.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getTournaments, deleteTournament, joinTournament, leaveTournament } from '../api/tournaments'
import { useAuth } from '../hooks/useAuth'
import TournamentCard from '../components/tournaments/TournamentCard'
import TournamentForm from '../components/tournaments/TournamentForm'
import ParticipantsModal from '../components/tournaments/ParticipantsModal'
import TournamentDetailsModal from '../components/tournaments/TournamentDetailsModal'
import CreateTournamentButton from '../components/tournaments/CreateTournamentButton'

const TournamentDashboard = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingTournament, setEditingTournament] = useState(null)
  const [viewingParticipants, setViewingParticipants] = useState(null)
  const [viewingDetails, setViewingDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'organized', 'joined'
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Fetch tournaments
  const { data: tournaments = [], isLoading, refetch } = useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournaments,
    refetchOnWindowFocus: true,
  })

  // Filter tournaments based on active tab
  const filteredTournaments = tournaments.filter((tournament) => {
    if (activeTab === 'organized') {
      return tournament.is_creator || tournament.created_by?.id === user?.id
    } else if (activeTab === 'joined') {
      return tournament.is_joined
    }
    return true // 'all' tab
  })

  // Delete tournament mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.refetchQueries({ queryKey: ['tournaments'] })
    },
  })

  // Join tournament mutation
  const joinMutation = useMutation({
    mutationFn: joinTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.refetchQueries({ queryKey: ['tournaments'] })
    },
  })

  // Leave tournament mutation
  const leaveMutation = useMutation({
    mutationFn: leaveTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.refetchQueries({ queryKey: ['tournaments'] })
    },
  })

  const handleEdit = (tournament) => {
    setEditingTournament(tournament)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleJoin = (id) => {
    joinMutation.mutate(id)
  }

  const handleLeave = (id) => {
    if (window.confirm('Are you sure you want to leave this tournament?')) {
      leaveMutation.mutate(id)
    }
  }

  const handleViewParticipants = (tournament) => {
    setViewingParticipants(tournament)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTournament(null)
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
            Tournaments
          </h1>
          <CreateTournamentButton onClick={() => setShowForm(true)} />
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 flex space-x-2 sm:space-x-4 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'all', label: 'All Tournaments' },
            { id: 'organized', label: 'Organized' },
            { id: 'joined', label: 'Joined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-neon-purple text-neon-purple'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tournament Form Modal */}
        {showForm && (
          <TournamentForm
            tournament={editingTournament}
            onClose={handleFormClose}
          />
        )}

        {/* Participants Modal */}
        {viewingParticipants && (
          <ParticipantsModal
            tournament={viewingParticipants}
            onClose={() => setViewingParticipants(null)}
          />
        )}

        {/* Tournament Details Modal */}
        {viewingDetails && (
          <TournamentDetailsModal
            tournament={viewingDetails}
            onClose={() => setViewingDetails(null)}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="text-neon-purple text-xl">Loading tournaments...</div>
          </div>
        )}

        {/* Tournaments Grid */}
        {!isLoading && filteredTournaments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/60 text-xl mb-4">
              {activeTab === 'organized' && 'You haven\'t organized any tournaments yet.'}
              {activeTab === 'joined' && 'You haven\'t joined any tournaments yet.'}
              {activeTab === 'all' && 'No tournaments yet.'}
            </p>
            {activeTab === 'all' && (
              <p className="text-white/40">Create your first tournament to get started!</p>
            )}
          </motion.div>
        )}

        {/* Tournament Cards */}
        {!isLoading && filteredTournaments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TournamentCard
                  tournament={tournament}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onViewParticipants={handleViewParticipants}
                  onViewDetails={setViewingDetails}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TournamentDashboard
