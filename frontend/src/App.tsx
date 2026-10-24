import React, { useState, useEffect } from 'react';
import type { Item, Match, DSStats } from './types';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ItemExplorer } from './components/ItemExplorer';
import { SmartMatchmaker } from './components/SmartMatchmaker';
import { QuadTreeRadar } from './components/QuadTreeRadar';
import { ADSInspector } from './components/ADSInspector';
import { ReportModal } from './components/ReportModal';
import { ItemDetailModal } from './components/ItemDetailModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'matches' | 'radar' | 'ads' | 'priority'>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<DSStats | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('alex.morgan@university.edu');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('priority');

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'LOST' | 'FOUND'>('LOST');
  const [inspectItem, setInspectItem] = useState<Item | null>(null);

  // Load Initial Data
  const refreshAllData = async () => {
    try {
      const [fetchedItems, fetchedMatches, fetchedStats] = await Promise.all([
        apiClient.getItems(),
        apiClient.getMatches(),
        apiClient.getDSStats()
      ]);
      setItems(fetchedItems);
      setMatches(fetchedMatches);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Filtered Items fetch whenever search or filters change
  useEffect(() => {
    apiClient.getItems({
      q: searchQuery,
      category: selectedCategory,
      type: selectedType,
      status: selectedStatus
    }).then(setItems);
  }, [searchQuery, selectedCategory, selectedType, selectedStatus]);

  // Actions
  const handleOpenReportModal = (type: 'LOST' | 'FOUND') => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleCreateItem = async (newItem: Partial<Item>) => {
    await apiClient.createItem(newItem);
    await refreshAllData();
  };

  const handleUpdateStatus = async (id: number, status: 'OPEN' | 'MATCHED' | 'RESOLVED') => {
    await apiClient.updateItemStatus(id, status);
    await refreshAllData();
    if (inspectItem && inspectItem.id === id) {
      setInspectItem({ ...inspectItem, status });
    }
  };

  const handleDeleteItem = async (id: number) => {
    await apiClient.deleteItem(id);
    await refreshAllData();
    if (inspectItem && inspectItem.id === id) {
      setInspectItem(null);
    }
  };

  const handleClaimMatch = async (lostId: number, foundId: number) => {
    await apiClient.claimMatch(lostId, foundId);
    await refreshAllData();
  };

  const handleCheckMatches = (_item?: Item) => {
    setActiveTab('matches');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenReportModal}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        matchesCount={matches.length}
      />

      {/* Main Content Area based on Active Tab */}
      <main style={{ flex: 1 }}>
        {activeTab === 'items' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchSubmit={(q) => setSearchQuery(q)}
              onSelectSuggestion={(s) => setSearchQuery(s)}
            />
            <ItemExplorer
              items={items}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectItem={(item) => setInspectItem(item)}
              onCheckMatches={handleCheckMatches}
            />
          </>
        )}

        {activeTab === 'matches' && (
          <div style={{ paddingTop: 32 }}>
            <SmartMatchmaker
              matches={matches}
              currentUser={currentUser}
              onClaimMatch={handleClaimMatch}
              onInspectItem={(item) => setInspectItem(item)}
            />
          </div>
        )}

        {activeTab === 'radar' && (
          <div style={{ paddingTop: 32 }}>
            <QuadTreeRadar
              items={items}
              onSelectItem={(item) => setInspectItem(item)}
            />
          </div>
        )}

        {activeTab === 'ads' && (
          <div style={{ paddingTop: 32 }}>
            <ADSInspector
              stats={stats}
              onRefreshStats={refreshAllData}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 13, 20, 0.9)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>TrackBack ADS • Advanced Data Structures &amp; Algorithms Course Project</span>
          <span>Engineered with React + TypeScript + Spring Boot + Java</span>
        </div>
      </footer>

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          initialType={reportModalType}
          currentUser={currentUser}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleCreateItem}
        />
      )}

      {/* Item Detail Drawer */}
      {inspectItem && (
        <ItemDetailModal
          item={inspectItem}
          onClose={() => setInspectItem(null)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteItem={handleDeleteItem}
          onFindMatches={handleCheckMatches}
        />
      )}
    </div>
  );
};

export default App;
